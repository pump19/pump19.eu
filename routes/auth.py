#!/usr/bin/env python3
# vim:fileencoding=utf-8:ts=8:et:sw=4:sts=4:tw=79

"""
routes/auth.py

Authentication routes for the "Pump19 Twitch Chat Golem" bottle application.

Copyright (c) 2020 Kevin Perry <perry at pump19 dot eu>
See the file LICENSE for copying permission.
"""

from bottle import redirect, request, template
from os import environ

import requests

# get settings for Twitch.tv authorization code flow
TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/authorize"
TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
TWITCH_VALID_URL = "https://id.twitch.tv/oauth2/validate"
TWITCH_USERS_URL = "https://api.twitch.tv/helix/users"
TWITCH_CLIENT_ID = environ["TWITCH_CLIENT_ID"]
TWITCH_CLIENT_SECRET = environ["TWITCH_CLIENT_SECRET"]
OAUTH_RESPONSE_URL = environ["OAUTH_RESPONSE_URL"]



def login():
    """Show the login page and create a new session."""
    session = request.environ.get("beaker.session")
    session.save()

    return template("login", session=session,
                    subtitle="Login",
                    twitch_oauth_url=TWITCH_OAUTH_URL,
                    twitch_client_id=TWITCH_CLIENT_ID,
                    oauth_response_url=OAUTH_RESPONSE_URL)


def oauth():
    """
    Handle the answer from Twitch and request an oauth token.
    Store both the token and the user name in the session.
    """
    session = request.environ.get("beaker.session")
    # make sure we get both state and code and the response is for this session
    state = request.query.get("state")
    code = request.query.get("code")
    if not state or not code or session.id != state:
        redirect("/logout")

    # now we need to get an access token
    token_opts = {
        "client_id": TWITCH_CLIENT_ID,
        "client_secret": TWITCH_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": OAUTH_RESPONSE_URL
    }
    try:
        token_request = requests.post(
                TWITCH_TOKEN_URL, params=token_opts,
                timeout=5)
        token_data = token_request.json()
    except Exception:
        redirect("/logout")

    # make sure we got our token
    if "access_token" not in token_data:
        redirect("/logout")

    # store the token in our session
    token = token_data["access_token"]
    session["oauth_token"] = token

    # now get the user name as well
    user_headers = {
        "Authorization": "Bearer {0}".format(token),
        "Client-ID": TWITCH_CLIENT_ID
    }
    try:
        user_request = requests.get(
                TWITCH_USERS_URL,
                headers=user_headers,
                timeout=5)
        user_data = user_request.json()
    except Exception:
        redirect("/logout")

    # make sure we got exactly one user
    if "data" not in user_data or len(user_data["data"]) != 1:
        redirect("/logout")

    # store user name in our session
    user_name = user_data["data"][0]["login"]
    session["user_name"] = user_name

    display_name = user_data["data"][0]["display_name"]
    session["display_name"] = display_name

    session["logged_in"] = True
    session.save()

    redirect("/login")


def logout():
    """Clear a user's session."""
    session = request.environ.get("beaker.session")
    session.delete()
    redirect("/login")

#!/usr/bin/env python3
# vim:fileencoding=utf-8:ts=8:et:sw=4:sts=4:tw=79

"""
routes/codefall.py

Codefall routes for the "Pump19 Twitch Chat Golem" bottle application.

Copyright (c) 2020 Kevin Perry <perry at pump19 dot eu>
See the file LICENSE for copying permission.
"""

from bottle import redirect, request, template
from os import environ
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import text

import requests

CODEFALL_CLAIM_URL = environ["CODEFALL_CLAIM_URL"]
CODEFALL_SHOW_URL = environ["CODEFALL_SHOW_URL"]
CODEFALL_ANNOUNCE_URL = environ["CODEFALL_ANNOUNCE_URL"]

RECAPTCHA_PUBLIC = environ["RECAPTCHA_PUBLIC"]
RECAPTCHA_SECRET = environ["RECAPTCHA_SECRET"]
RECAPTCHA_VERIFY_URL = environ["RECAPTCHA_VERIFY_URL"]


def main(db):
    """Show a list of all codefall pages and a form to add new ones."""
    session = request.environ.get("beaker.session")
    user_name = session.get("user_name")

    # we can't retrieve keys without user name
    if not user_name:
        return template("codefall", session=session,
                        subtitle="Codefall")

    # get all codes for the user from the database
    codes_qry = text("""SELECT key, description, code, code_type, claimed
                   FROM codefall
                   LEFT OUTER JOIN codefall_keys
                       ON codefall.cid = codefall_keys.kid
                   WHERE
                       user_name = :user_name
                       AND
                       key IS NOT NULL
                   ORDER BY description""")
    codes = db.execute(codes_qry, {"user_name": user_name})

    unclaimed, claimed = list(), list()
    for code in codes:
        entry = {"description": code.description,
                 "code_type": code.code_type}

        if not code.claimed:
            entry["secret"] = code.key
            unclaimed.append(entry)
        else:
            claimed.append(entry)

    return template("codefall", session=session,
                    subtitle="Codefall",
                    unclaimed=unclaimed, claimed=claimed,
                    show_url=CODEFALL_SHOW_URL,
                    announce_url=CODEFALL_ANNOUNCE_URL)


def add(db):
    """Add a new codefall page."""
    session = request.environ.get("beaker.session")
    # we require users to be logged in when adding new codes
    if not session.get("logged_in", False):
        redirect("/codefall")

    # get all mandatory items
    user_name = session.get("user_name")
    description = request.forms.getunicode("description")
    code = request.forms.getunicode("code")
    code_type = request.forms.getunicode("code_type")
    if not all((user_name, description, code, code_type)):
        redirect("/codefall")

    new_code_qry = text("""INSERT INTO codefall (description,
                                            code,
                                            code_type,
                                            user_name)
                      VALUES (:description, :code, :code_type, :user_name)""")
    try:
        db.execute(new_code_qry,
                   {"description": description,
                    "code": code,
                    "code_type": code_type,
                    "user_name": user_name})
    except IntegrityError:
        redirect("/codefall")

    # everything seems fine, store the data now
    db.commit()

    # now redirect back to codefall page
    redirect("/codefall")


def announce(db):
    """Notify PostgreSQL listeners on codefall channel."""
    session = request.environ.get("beaker.session")

    # we require users to be logged in when announcing their codes
    if not session.get("logged_in", False):
        return None

    user_name = session.get("user_name")
    secret = request.forms.getunicode("secret")
    if not all((user_name, secret)):
        return None

    announce_qry = text("""SELECT pg_notify('codefall',
                        (SELECT key
                         FROM codefall_unclaimed
                         WHERE
                            user_name = :user_name
                            AND
                            key = :secret
                         LIMIT 1))""")

    db.execute(announce_qry,
               {"user_name": user_name, "secret": secret})
    db.commit()

    return None


def claim(secret, db):
    """Claim a codefall page."""
    session = request.environ.get("beaker.session")

    # ask google whether the CAPTCHA was solved
    rc_response = request.forms.getunicode("g-recaptcha-response")
    verify_opts = {
        "secret": RECAPTCHA_SECRET,
        "response": rc_response
    }
    try:
        verify_request = requests.post(
            RECAPTCHA_VERIFY_URL, params=verify_opts,
            timeout=5)
        verify_data = verify_request.json()
    except Exception:
        return template("codefall_claim", session=session,
                        subtitle="Codefall")

    is_human = verify_data.get("success")
    if not is_human:
        return template("codefall_claim", session=session,
                        subtitle="Codefall")

    claim_code_qry = text("""UPDATE codefall
                        SET claimed = TRUE
                        WHERE
                            claimed = FALSE
                            AND cid = (SELECT cid
                                       FROM codefall_unclaimed
                                       WHERE key = :secret)
                        RETURNING description, code, code_type""")

    code = db.execute(claim_code_qry, {"secret": secret})
    db.commit()
    code = code.first()
    if not code:
        return template("codefall_claim", session=session,
                        subtitle="Codefall")

    entry = {"description": code.description,
             "code": code.code,
             "code_type": code.code_type}

    return template("codefall_claim", session=session,
                    subtitle="Codefall", entry=entry)


def show(secret, db):
    """Show a codefall page (letting people claim it)."""
    session = request.environ.get("beaker.session")

    show_code_qry = text("""SELECT description, code_type
                       FROM codefall_unclaimed
                       WHERE key = :secret""")

    code = db.execute(show_code_qry, {"secret": secret})
    code = code.first()
    if not code:
        return template("codefall_show", session=session,
                        subtitle="Codefall")

    claim_url = CODEFALL_CLAIM_URL.format(secret=secret)

    entry = {"description": code.description,
             "claim_url": claim_url,
             "code_type": code.code_type}

    return template("codefall_show", session=session,
                    subtitle="Codefall",
                    entry=entry, rc_sitekey=RECAPTCHA_PUBLIC)

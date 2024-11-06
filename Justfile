set dotenv-load

revision := `jj log --limit 1 --no-graph --template 'change_id ++ " " ++ commit_id'`
image := "ghcr.io/pump19/pump19.eu-fresh:latest"

container:
    buildah build --build-arg JJ_REVISION="{{revision}}" -t {{image}} .

# push the container to the GitHub container registry
publish: container
    buildah login ghcr.io --username $GHCR_USER_NAME --password $GHCR_ACCESS_TOKEN
    buildah push {{image}}

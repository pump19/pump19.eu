revision := `jj log --limit 1 --no-graph --template 'change_id ++ " " ++ commit_id'`

container:
    echo {{revision}}
    buildah build --build-arg JJ_REVISION="{{revision}}" -t pump19.eu .
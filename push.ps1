$msg = Read-Host "Commit message likho"

cd "d:\AjwaHub Web\Admin"
git add .
git commit -m $msg
git push origin main

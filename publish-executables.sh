#!/bin/bash


VERSION=`cat package.json | jq .version | sed 's/"//g'`
echo $VERSION

# Publish package to npm
npm publish

#Create and publish executables.
# You need pkg@4.3.8. 4.4.0 produces a bad file for windows.
mkdir -p dist/$VERSION
pkg -t node10-linux-x64 package.json --output dist/$VERSION/linux/diffjam
pkg -t node10-win-x64 package.json --output dist/$VERSION/windows/diffjam.exe
pkg -t node10-macos-x64 package.json --output dist/$VERSION/osx/diffjam

#PUBLISH TO S3
aws s3 sync dist/ s3://diffjam --profile=diffjam

aws s3api put-object-acl --bucket diffjam --key $VERSION/linux/diffjam --acl public-read --profile=diffjam
aws s3api put-object-acl --bucket diffjam --key $VERSION/windows/diffjam.exe --acl public-read --profile=diffjam
aws s3api put-object-acl --bucket diffjam --key $VERSION/osx/diffjam --acl public-read --profile=diffjam

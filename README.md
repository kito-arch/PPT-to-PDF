## Description
This repo will let you deploy a `ppt to pdf` service, using S3 as storage, in a snap. This service will get the ppt file from S3 storage and upload the pdf file back to S3 storage.

## Pre requirements
1. Install [Docker](https://www.docker.com/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)

## Deploying service
1. Clone the repo using `git clone https://github.com/kito-arch/ppt-to-pdf.git`
2. Provide env variables by creating copying `.env.sample` and renaming the copied file to `.env`. Replace the respective env values.
3. Run command: `docker-compose up` to build and run the container of `ppt to pdf` image. You may run the command `docker-compose up -d` instead, to run the service in the background.
4. The above command will take some time and when done, you will see `Server running on port 3000` logged on your terminal. This means our service is running on port 3000.
5. In case you change the code or Dockerfile, you would need to run docker compose by forcefully rebuilding a new image by: `docker-compose up --build`

## API format
### Request
```
{
    "bucket": "<your s3 bucket name>",
    "pptKey": "<your ppt path i.e 'public/ppt/ppt1.pptx' >"
}
```
### Response
```
{
  "message": "Conversion successful",
  "pdfUrl": "<Full url for your generated pdf i.e 'https://bucket.s3.region.amazonaws.com/public/ppt/pp1.pdf' >"
}
```


## Points to consider
This is a basic utility, you may want to improve the security by:
1. Providing dynamic env rather than storing in .env using Key Vaults.
2. Restricting the incoming request only from your authenticated apps by CORS.
3. And so on..

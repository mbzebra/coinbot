cd
cd GitHub/coinbot
rm coinbot.zip
cd src 
zip -r coinbot.zip  .
mv coinbot.zip ../
cd ..
aws lambda update-function-code --function-name coins --zip-file fileb://coinbot.zip

echo '---------------------------------------------------'
echo 'TravelQ Zip Created and AWS Lambda Function updated'
echo '---------------------------------------------------'




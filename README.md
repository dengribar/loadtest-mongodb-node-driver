### Load test of MongoDB Node.js driver

* To load test v**4.11.0**, run `npm run loadtest1`
* To load test v**4.12.1**, run `npm run loadtest2`

Results comparison on my M1 Max MacBook Pro:

<img width="504" alt="image" src="https://user-images.githubusercontent.com/111731892/204788451-a685d188-e521-4b14-9c46-2b69790e48d9.png">

<img width="501" alt="image" src="https://user-images.githubusercontent.com/111731892/204788488-42c15ff0-3ee1-4e88-8a4d-fa40ca6b11f1.png">

v**4.12.1** managed to process the data significantly faster, due to "Performance Improvements with Buffering" landed in v**4.12.0** ([ref](https://github.com/mongodb/node-mongodb-native/releases/tag/v4.12.0#:~:text=Performance%20Improvements%20with%20Buffering))

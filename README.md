# Vehicle Routing Problem 

Hello hello, welcome to the repo. 

## Setup

This repository assumes that you have the LTS (20.16.0) version of node.js installed on your machine. 

For initial installation - please refer to the [Official Node.js download page](https://nodejs.org/en/download/)

After intallation you will be able to execute the code, with the test suite by running 

`python3 evaluateShared.py --cmd "node index.js" --problemDir "./problems"`

To run the codebase without the test suite, you can run 

`node index.js {problem_path}` where problem_path is the path to a problem file, as describe within the challenge document.

## Tools Used

For the building of this project here are all of the resources I used
1) a lot of the API search was done on the [Node.js reference page](https://nodejs.org/docs/latest-v20.x/api/index.html).
2) Regular Expressions were written using google, and https://regex101.com/
3) A [random article about Math](https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-243.php) - so I was 100% sure Math.hypot was the same as Euclidean distance. I ended up not even using this source, but it was an interesting read. 

## Final Comments 

This codebase makes a numerious bunch of assumptions. We assume that the file input will always be present, and that many amounts of errors (such as typing issues, or runtime problems) should not happen under the assumed scenarios outlined in the challenge. 
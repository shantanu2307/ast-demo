# Problem Statement

The codebase has a set of files in `__fixtures__/input/` which import `testMe` function from a file `./testMe.js` and invoke the `testMe()` function. 

The task is to:-
1. Change the import of `testMe` function to `astIsGreat` from `./astIsGreat.js`
2. Change the invocation of `testMe()` function to `astIsGreat()`

The input and output files are setup for you in `__fixtures__/input/` and `__fixtures__/output/` respectively.
You need to make changes in `scripts/change-function-invocation.ts` and run to check the correctness. DO NOT change any other files.

# Installation

`npm install`

# Testing

`npm run test`

# You can refer to the following resources to check how to manipulate ASTs 
- [AST Explorer](https://astexplorer.net/)

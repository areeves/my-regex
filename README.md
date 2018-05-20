# my-regex

Implmentation of a regular expression matcher from scratch in JavaScript.

## Motivation

*tl;dr:* Because I can.

In May 2018 I was interviewing for a new position.  One of the several technical interviews asked me to write some code
to do the following (paraphrasing from memory):

    Write a program that accepts strings of [a-z] and using a word list file, determine if the string matches a
    sequence of words, without spaces.  So, 'iamvalid' would be valid, but 'asdfasdf' would not be.

I was stumped for two reasons.  First, I see recursion everywhere I look, even for problems better solvedi
iteratively... so I have a habit of looking for non-recursive solutions first.  Turns out here was looking for a
recursive solution.  Second; even when considering recursion, I had this nagging feeling that there was a better
way instead of brute-force.

Later, I was tossing the problem about in my head and thought: "ya know, if you treated this a regular language
problem, you could just turn the word listinto a regular expression which can be compiled into something much much
faster".  Despite my better judgement, I decided to quickly throw it at `node` to see if it would choke on a
word list containing 675k+ words.  To my surprise, the `RegExp` class handled it in only a few seconds:

```javascript
const fs = require('fs')

async function readFile(p) {
  return new Promise( (res,rej) => fs.readFile(p,'utf8',(e,d) => e ? rej(e) : res(d) ))
}

async function getWordList() {
  // http://app.aspell.net/create?max_size=95&spelling=US&spelling=GBs&spelling=GBz&spelling=CA&spelling=AU&max_variant=3&diacritic=strip&special=hacker&special=roman-numerals&download=wordlist&encoding=utf-8&format=inline
  const text = await readFile('wordlist.txt')
  const a = text.split("\n").map( v => v.trim() ).filter( v => v )
  return a.slice( a.indexOf('---') + 1 )
}

async function getRegEx() {
  const wordlist = await getWordList()
  return new RegExp('^(' + wordlist.join('|') + ')*$')
}

getRegEx()
.then( re => re.test( "I'mapassingstring" ) )
.then( console.log )
```

If I used `RegExp`, why this project?  Well, mostly because I wanted to see how my own implementation would stack up.i
Haven't finished it yet, so I don't know.  My approach is fairly simplistic, so I'm guessing it might blow up on a NFA
large enough to represent more than half a million words.

## Status

No top-level class yet.  Just a few classes under unit/integration tests for some of the various things needed.

Implemented so far:
* string tokens
* `(` and `)` for nested expressions
* the union (pipe) operator
Can parse and compile `foo(bar|baz)wakka` so far.

## TODO

* Add support for the star operator
* Write method to remove epsilon transitions from NFA
* Write the executor to actually run the FSM

Maybe later add `?` and `+`


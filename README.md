# ForthScript

My own spinoff Forth-esque dialect heavily based upon Chuck Moore's work.
Written entirely in JavaScript for the purposes of embedded browser
applications. Goal of this work is making the ideas in forth as readily
accessible as possible to the intrigued user.

![CLI](https://i.imgur.com/4JRxLn3.png)

![Editor](https://i.imgur.com/2dkv0Zn.png)


In this implimentation the language consists of *only* 31 or so "words", also
known as "primitives". They are based upon, but not strictly following, the F18
instruction set by GreenArray. Everything else is built upon this foundation.

They are as follows:

| Opcode    | Notes                                 |
| :-------- | :------------------------------------ |
| `:`       | define, terminated by `;`             |
| `->`      | jump-ahead to `>!` or exit *name*     |
| `<-`      | jump-back to `!<` or loop *name*      | 
| `name`    | call to *name*                        |
| `next`    | loop to `for` if R != 0 (decrement R) |
| `if`      | jump to `then` if T=0                 |
| `-if`     | jump to `then` if T≥0                 |
| `@b`      | fetch addr via B                      |
| `@+`      | fetch addr via A (autoincrement A)    |
| `@`       | fetch addr via A                      |
| `!b`      | store to addr via B                   |
| `!+`      | store to addr via A (autoincrement A) |
| `!`       | store to addr via A                   |
| `+*`      | multiply step                         |
| `2*`      | left shift                            |
| `2/`      | right shift                           |
| `inv`     | invert all bits                       |
| `+`       | add                                   |
| `and`     | bitwise and                           |
| `xor`     | bitwise exclusive or                  |
| `drop`    | pop the data stack                    |
| `dup`     | push T to the data stack              | 
| `over`    | push S to the data stack              | 
| `r>`      | pop R push T                          |
| `>r`      | pop T push R                          |
| `p`       | fetch *from* register P               |
| `a`       | fetch *from* register A               |
| `p!`      | store *into* register P               |
| `a!`      | store *into* register A               |
| `b!`      | store *into* register B               |
| `nop`     | do nothing                            |

### Additional words
| Opcode    | Notes                                 |
| :-------- | :------------------------------------ |
| `(`       | comment, terminated by `)`            |
| `.`       | print T as decimal                    |
| `.e`      | print T as ascii char                 |
| `include` | load `.fs` files                      |
| `abort`   | terminate process with error message  |
| `bye`     | exit jforth                           |


## Architecture

The model of this virtual machine is as follows:
- **Return stack** consists of 8 registers addressed circularly (no fixed top or bottom).
- **R** extends this stack to 9 entries but only 8 are circular.
- **P** serves as a “program counter”, holding the address of the next word in the instruction stream. It is incremented after each word is fetched.
- **A** is a general purpose read/write address or data register.
- **B** is a write only address register.
- **T** is the top word of a 10-element data stack.
- **S** is the second word of a 10-element data stack.
- **Data Stack** is 8 circularly addressed registers constituting the third through 10th elements of a 10-element stack.


## Installation

Download the project then run:

```bash
node fs.js
```

If you want to turn it into an executable. Make sure the following
shebang line is included at top of the `jforth.js` file.

```javascript
#!/usr/bin/env node
```

Change the permission of the file.

```bash
chmod +x script.js
```

Move it into your preferred $PATH.

```bash
sudo mv jforth.js /usr/local/bin/jforth
```

Now you should be able to run ForthScript from anywhere.

```bash
jforth
```


## Example Program

```forth
( Fibonacci Generator )

: print ( -- )
  10 .e dup .
;

: 2dup ( n1 n2 -- n1 n2 n1 n2 )
  over over
;

: 2drop ( n1 n2 -- )
  drop drop
;

: fib ( u -- )
  >r 0 1 r>
  for print 2dup + rot drop next
  2drop
;
```

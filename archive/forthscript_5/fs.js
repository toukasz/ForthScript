const addr = Array(2**14).fill(0)

const p = {}
const r = {}
const d = {}

let P = 0
let R = 0

let T = 0
let S = 0

let A = 0
let B = 0

r.stack = Array(8).fill(0)
d.stack = Array(8).fill(0)

d.push = n => {
    d.stack.push(S)
    d.stack.shift()
    S = T
    T = n
}

d.pop = n => {
    n = T
    T = S
    S = d.stack.pop()
    d.stack.unshift(S)
    return n
}

r.push = n => {
    r.stack.push(R)
    r.stack.shift()
    R = n
}

r.pop = n => {
    n = R
    R = r.stack.pop()
    r.stack.unshift(R)
    return n
}

p.push = n => {
    r.push(P)
    P = n
}

p.pop = n => {
    P = r.pop()
}

function filter(chunk) {
    return chunk
        .split(/[ \t\n]/)
        .filter(word => word != '')
}

function parse(chunk) {
    p.push(0)
    const l = chunk.length
    while (P < l) {
        if (P < 0) break
        read(chunk.at(P), chunk)
        if (abort) return
        P++
    }
    p.pop()
}

function read(word, chunk) {
    let i
    i = dict.findIndex(obj => obj.name == word)
    if (i != -1) return parse(dict[i].chunk)
    i = ops.findIndex(obj => obj.name == word)
    if (i != -1) return ops[i].exec(chunk)
    i = /^-{0,1}[0-9]+$/
    if (i.test(word)) return d.push(parseInt(word))
    error('Undefined word', chunk)
}

let abort = false
function error(msg, chunk) {
    abort = true
    chunk[P] = `>>>${chunk.at(P)}<<<`
    console.error(`\n${msg}\n${chunk.join(' ')}`)
    d.stack.fill(0)
    r.stack.fill(0)
    P = 0
    R = 0
    T = 0
    S = 0
    A = 0
    B = 0
}

const dict = []
const ops = [{
// Jumps
    name: ':',
    exec: chunk => {
        const a = P + 2
        const b = chunk.slice(a).findIndex(word => word == ';')
        if (b == -1) return error("Missing ';' token", chunk)
        const name = chunk.at(P + 1)
        const i = dict.findIndex(obj => obj.name == name)
        if (i != -1) {
            dict.splice(i, 1)
            process.stdout.write(`redefined ${name} `)
        }
        dict.push({ name: name, chunk: chunk.slice(a, a + b) })
        P = a + b
    }
}, {
    name: '->',
    exec: chunk => {
        const i = chunk.slice(P).findIndex(word => word == '>!')
        if (i == -1) return P = -2
        P += i
    }
}, {
    name: '>!',
    exec: () => {}
}, {
    name: '<-',
    exec: chunk => {
        const i = chunk.slice(0, P).reverse().findIndex(word => word == '!<')
        if (i == -1) return P = -1
        P -= i + 1
    }
}, {
    name: '!<',
    exec: () => {}
}, {
    name: 'if',
    exec: chunk => {
        if (T == 0) return
        const i = chunk.slice(P).findIndex(word => word == 'then')
        if (i == -1) return P = -2
        P += i
    }
}, {
    name: '-if',
    exec: chunk => {
        if (T < 0) return
        const i = chunk.slice(P).findIndex(word => word == 'then')
        if (i == -1) return P = -2
        P += i
    }
}, {
    name: 'then',
    exec: () => {}
}, {
// Memory
    name: '@+',
    exec: () => { d.push(addr.at(A)); A++ }
}, {
    name: '@b',
    exec: () => d.push(addr.at(B))
}, {
    name: '@',
    exec: () => d.push(addr.at(A))
}, {
    name: '!+',
    exec: () => { addr[A] = d.pop(); A++ }
}, {
    name: '!b',
    exec: () => addr[B] = d.pop()
}, {
    name: '!',
    exec: () => addr[A] = d.pop()
}, {
// ALU
    name: '+*',
    exec: () => {
        if (A & 1 != 0) T += S
        S <<= 1
        A >>= 1
    }
}, {
    name: '2*',
    exec: () => T <<= 1
}, {
    name: '2/',
    exec: () => T >>= 1
}, {
    name: 'inv',
    exec: () => T = ~T
}, {
    name: '+',
    exec: () => d.push(d.pop() + d.pop())
}, {
    name: 'and',
    exec: () => d.push(d.pop() & d.pop())
}, {
    name: 'xor',
    exec: () => d.push(d.pop() ^ d.pop())
}, {
// Stack
    name: 'drop',
    exec: () => d.pop()
}, {
    name: 'dup',
    exec: () => d.push(T)
}, {
    name: 'over',
    exec: () => d.push(S)
}, {
    name: '>r',
    exec: () => r.push(d.pop())
}, {
    name: 'r>',
    exec: () => d.push(r.pop())
}, {
    name: 'nop',
    exec: () => {}
}, {
// Register
    name: 'p',
    exec: () => d.push(P)
}, {
    name: 'a',
    exec: () => d.push(A)
}, {
    name: 'p!',
    exec: () => P = d.pop()
}, {
    name: 'a!',
    exec: () => A = d.pop()
}, {
    name: 'b!',
    exec: () => B = d.pop()
}, {
// Miscellaneous
    name: '.n',
    exec: () => process.stdout.write(d.pop().toString())
}, {
    name: '.c',
    exec: () => process.stdout.write(String.fromCharCode(d.pop()))
}, {
    name: '(',
    exec: chunk => P += chunk.slice(P).findIndex(word => word == ')')
}, {
    name: 'include',
    exec: chunk => {
        const name = chunk.at(P += 1)
        try     { code.src = require('fs').readFileSync(name, 'utf8') }
        catch   { code.src = '' }
        parse(filter(code.src))
    }
}, {
    name: 'bye',
    exec: () => process.exit()
}]


// I.O. Interface
const code = {}
try     { code.ext = require('fs').readFileSync('ext.fs', 'utf8') }
catch   { code.ext = '' }
parse(filter(code.ext))

const rl = require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout,
    prompt: ''
})

process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name == 'q') error('Execution terminated', [])
})

rl.on('line', chunk => {
    abort = false
    process.stdout.write(`\x1b[A${chunk} `)
    parse(filter(chunk))
process.stdout.write(`\n${d.stack.join(' ')} ${S} ${T} `) // temporary
    if (!abort) process.stdout.write(' ok\n')
})

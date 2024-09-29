( STACK MANIPULATION )
: nip >r drop r> ;          ( n1 n2 -- n2 )
: swap over >r nip r> ;     ( n1 n2 -- n2 n1 ) 
: tuck swap over ;          ( n1 n2 -- n2 n1 n2 )
: rot >r swap r> swap ;     ( n1 n2 n3 -- n2 n3 n1 )
: r r> r> dup >r swap >r ;  ( -- r )

: -rot swap >r swap r> ;    ( n1 n2 n3 -- n3 n1 n2 )
: ?dup if -> then dup ;     ( n -- n ? )
: 2drop drop drop ;         ( n1 n2 -- )
: 2nip >r nip nip r> ;      ( n1 n2 n3 n4 -- n3 n4 )
: 2dup over over ;          ( n1 n2 -- n1 n2 n1 n2 )
: 2swap >r -rot r> -rot ;   ( n1 n2 n3 n4 -- n3 n4 n1 n2 )

: 2over >r >r 2dup r> -rot r> -rot ;    ( n1 n2 n3 n4 -- n1 n2 n3 n4 n1 n2 )
: 2tuck ( ... ) ;                       ( n1 n2 n3 n4 -- n3 n4 n1 n2 n3 n4 )
: third >r >r dup r> swap r> swap ;     ( n1 n2 n3 -- n1 n2 n3 n1 )
: fourth >r >r >r dup r> swap 
         r> swap r> swap ;              ( n1 n2 n3 n4 -- n1 n2 n3 n4 n1 )

( ALTERNATIVES )
( : nip >r drop r> ; )
( : nip over xor xor ; )
( : swap >r a! r> a ; )
( : tuck a! >r a r> a ; )
( : rot >r >r a! r> r> a ; )
( : r r> r> a! >r >r a ; )

( COMPARISON )
: < - -if drop 0 -> then drop -1 ;          ( n1 n2 -- f )
: = - if -> then drop 1 ;                   ( n1 n2 -- f )
: > swap - -if drop 0 -> then drop -1 ;     ( n1 n2 -- f )
: 0< -if drop 0 -> then drop -1 ;           ( n -- f )
: 0= if -> then drop -1 ;                   ( n -- f )
: 0> negate -if drop 0 -> then drop -1 ;    ( n -- f )
: true   0 ;                                ( -- f )
: false -1 ;                                ( -- f )

( ARITHMETIC AND LOGICAL )
: - inv + 1 + ;                                             ( n1 n2 -- diff )
: 1+ 1 + ;                                                  ( n -- n+1 )
: 1- -1 + ;                                                 ( n -- n-1 )
: 2+ 2 + ;                                                  ( n -- n+2 )
: 2- -2 + ;                                                 ( n -- n-2 )
: * -if >r negate a! r> negate a swap then a! 0
    !< >r a if drop drop r> -> then drop r> +* <- ;         ( n1 n2 -- prod )
: / a! 0 !< >r -if drop r> 1- -> then a - r> 1+ <- ;        ( n1 n2 -- quot )
: mod swap !< over - -if + -> then <- ;                     ( n1 n2 -- rem )
( : mod a! !< dup >r a - -if drop r> -> then r> drop <- ; )
: /mod over over mod rot rot / ;                            ( n1 n2 -- rem quot )
: */mod >r * r> /mod ;                                      ( n1 n2 n3 -- rem quot )
: */ >r * r> / ;                                            ( n1 n2 n3 -- quot )
: max over over < if drop nip -> then drop drop ;           ( n1 n2 -- max )
: min over over > if drop nip -> then drop drop ;           ( n1 n2 -- min )
: abs    -if inv 1 + ;                                      ( n -- |n| )
: negate     inv 1 + ;                                      ( n -- -n )
: or over over and >r xor r> + ;                            ( n1 n2 -- or )

( MEMORY )
: ?  @ . ;                                                  ( -- )
: +! @ + ! ;                                                ( n -- )
: move 1- for swap a! a 1+ swap @ swap a! ! a 1+ next ;     ( addr dest u -- )
: fill >r if drop r> drop -> then 1- r> dup !+ <- ;         ( u byte -- )
: erase 1- for 0 !+ next ;                                  ( u -- )
: dump if drop cr -> then cr a . 58 .e space
       @+ dup . space .e 1- <- ;                            ( u -- )

( CONTROL STRUCTURES )
: exit r> drop -2 >r ; ( -- )

( TERMINAL INPUT-OUTPUT )
: cr 10 .e ;                            ( -- )
: emit .e ;                             ( char -- )
: space 32 .e ;                         ( -- )
: spaces if drop -> then 1- 32 .e <- ;  ( u -- )
: page 64 for cr next ;                 ( -- )
: type if drop -> then 1- @+ .e <- ;    ( u -- )
: .r for space next . ;                 ( n u -- )
: .s >r >r >r >r space dup . space r> dup . space
	 r> dup . space r> dup . space r> dup . space
; ( -- )

: help
( Please check the README.md for more information. )
( There is a good chance everything is not well documented yet, )
( so, apologies in advance. )
80 emit 108 emit 101 emit 97 emit 115 emit 101 emit 32 emit 99 emit 104 emit
101 emit 99 emit 107 emit 32 emit 116 emit 104 emit 101 emit 32 emit 82 emit 69
emit 65 emit 68 emit 77 emit 69 emit 46 emit 109 emit 100 emit 32 emit 102 emit
111 emit 114 emit 32 emit 109 emit 111 emit 114 emit 101 emit 32 emit 105 emit
110 emit 102 emit 111 emit 114 emit 109 emit 97 emit 116 emit 105 emit 111 emit
110 emit 46 emit 32 emit 84 emit 104 emit 101 emit 114 emit 101 emit 32 emit
105 emit 115 emit 32 emit 97 emit 32 emit 103 emit 111 emit 111 emit 100 emit
32 emit 99 emit 104 emit 97 emit 110 emit 99 emit 101 emit 32 emit 101 emit 118
emit 101 emit 114 emit 121 emit 116 emit 104 emit 105 emit 110 emit 103 emit 32
emit 105 emit 115 emit 32 emit 110 emit 111 emit 116 emit 32 emit 119 emit 101
emit 108 emit 108 emit 32 emit 100 emit 111 emit 99 emit 117 emit 109 emit 101
emit 110 emit 116 emit 101 emit 100 emit 32 emit 121 emit 101 emit 116 emit 44
emit 32 emit 115 emit 111 emit 44 emit 32 emit 97 emit 112 emit 111 emit 108
emit 111 emit 103 emit 105 emit 101 emit 115 emit 32 emit 105 emit 110 emit 32
emit 97 emit 100 emit 118 emit 97 emit 110 emit 99 emit 101 emit 46 emit 
;

: intro
( ForthScript 0.1.0, Open Source (2024) by T. Szulc )
( Type 'bye' to exit )
70 .e 111 .e 114 .e 116 .e 104 .e 83 .e 99 .e 114 .e 105 .e 112 .e 116 .e 32 .e
48 .e 46 .e 49 .e 46 .e 48 .e 44 .e 32 .e 79 .e 112 .e 101 .e 110 .e 32 .e 83
.e 111 .e 117 .e 114 .e 99 .e 101 .e 32 .e 40 .e 50 .e 48 .e 50 .e 52 .e 41 .e
32 .e 98 .e 121 .e 32 .e 84 .e 46 .e 32 .e 83 .e 122 .e 117 .e 108 .e 99 .e 10
.e 84 .e 121 .e 112 .e 101 .e 32 .e 39 .e 98 .e 121 .e 101 .e 39 .e 32 .e 116
.e 111 .e 32 .e 101 .e 120 .e 105 .e 116 .e 10 .e
; intro

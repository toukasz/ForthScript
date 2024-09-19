: intro ( PRINT STARTUP MESSAGE )
70 .c 111 .c 114 .c 116 .c 104 .c 83 .c 99 .c 114 .c 105 .c
112 .c 116 .c 32 .c 48 .c 46 .c 49 .c 46 .c 48 .c 44 .c 32 .c
79 .c 112 .c 101 .c 110 .c 32 .c 83 .c 111 .c 117 .c 114 .c
99 .c 101 .c 32 .c 40 .c 50 .c 48 .c 50 .c 52 .c 41 .c 32 .c
98 .c 121 .c 32 .c 84 .c 46 .c 32 .c 83 .c 122 .c 117 .c 108 .c
99 .c 10 .c 84 .c 121 .c 112 .c 101 .c 32 .c 39 .c 98 .c 121 .c
101 .c 39 .c 32 .c 116 .c 111 .c 32 .c 101 .c 120 .c 105 .c
116 .c 10 .c
; intro

( STACK MANIPULATION )
: nip >r drop r> ;          ( n1 n2 -- n2 )
: swap over >r nip r> ;     ( n1 n2 -- n2 n1 ) 
: tuck swap over ;          ( n1 n2 -- n2 n1 n2 )
: rot >r swap r> swap ;     ( n1 n2 n3 -- n2 n3 n1 )
: r r> r> dup >r swap >r ;  ( -- r )

( ALTERNATIVES )
( : nip >r drop r> ; )
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

( ARITHMETIC AND LOGICAL )
: - inv + 1 + ;                                             ( n1 n2 -- diff )
: 1+ 1 + ;                                                  ( n -- n+1 )
: 1- -1 + ;                                                 ( n -- n-1 )
: * -if >r negate a! r> negate a swap then a! 0
    !< >r a if drop drop r> -> then drop r> +* <- ;         ( n1 n2 -- prod )
: / a! 0 !< >r -if drop r> 1- -> then a - r> 1+ <- ;        ( n1 n2 -- quot )
: mod a! !< dup >r a - -if drop r> -> then r> drop <- ;     ( n1 n2 -- rem )
: max over over < if drop nip -> then drop drop ;           ( n1 n2 -- max )
: min over over > if drop nip -> then drop drop ;           ( n1 n2 -- min )
: abs    -if inv 1 + ;                                      ( n -- |n| )
: negate     inv 1 + ;                                      ( n -- -n )
: or over over and >r xor r> + ;                            ( n1 n2 -- or )

( MEMORY )
: ?  @ .n ;                                             ( -- )
: +! @ + ! ;                                            ( n -- )
: move ( to be added ) ;                                ( dest u -- )
: fill >r if drop r> drop -> then 1- r> dup !+ <- ;     ( u byte -- )
: dump if drop -> then cr a .n 58 .c space
       @+ dup .n space .c 1- <- ;                       ( u -- )

( CONTROL STRUCTURES )
: exit r> drop -2 >r ; ( -- )

( TERMINAL INPUT-OUTPUT )
: cr 10 .c ;                            ( -- )
: space 32 .c ;                         ( -- )
: spaces if drop -> then 1- 32 .c <- ;  ( u -- )
: type if drop -> then 1- @+ .c <- ;    ( u -- )

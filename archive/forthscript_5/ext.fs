: nip >r drop r> ;                  ( n1 n2 -- n2 )
: swap over >r >r drop r> r> ;      ( n1 n2 -- n2 n1 )
: tuck ;
: rot >r swap r> swap ;             ( n1 n2 n3 -- n2 n3 n1 )
: r r> r> dup >r swap >r ;          ( -- R )
: - inv + 1 + ;                     ( n1 n2 -- diff )
: * -if minus >r minus r> then
    a! 0 !< a if drop -> then drop
    +* <- >! nip ;                  ( n1 n2 -- prod )

: -/ >r a - -if r> -> then r> 1 + ;
: / a! 0 !< >r -if drop r> -> then r> -/ <- ; ( account for edge cases )

: minus inv 1 + ;

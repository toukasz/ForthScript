( Fibonacci Generator )

: print 10 .e dup . ; ( -- )

: fib ( u -- )
  ( init ) >r 0 1 r>
  ( loop ) for print 2dup + rot drop next
  ( exit ) 2drop
;


( PRIME NUMBERS GENERATOR )

: ?prime ( n -- )
( init ) 0 a!
( loop ) !<
           @ if drop dup ! . space -> then
           over swap mod if drop drop -> then
           drop @+ drop
         <-
;

: !prime ( u -- )
( init ) 0 a! 2 ! 3
( loop ) !< 2dup = if 2drop -> then drop
         dup ?prime 1 + <- >!
;

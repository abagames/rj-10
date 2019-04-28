import * as rj10 from "../main";

// cSpell: disable
rj10.init(
  [
    String.raw`
Write tilemap with
text to make game

Colored text becomes
actor (game object)

(e.g. @      o    )
      c      y

Arrow keys to move
    `,
    String.raw`
 @cyan    @blue   actor: Player
 cc       bb

  red      purple actor: Enemy
  r        p

  yellow   green  actor: Goal
  y        g

  gray            actor: Wall
    a
`,
    String.raw`
Character in actor
defines behavior

[@]: User operation
[^Z>nvz<N]: Forward



        N^Z
        ygy
        <@>
        gcg
        zvn
        ygy



`,
    String.raw`
Forward actors
reflect with [-|/\]
-------------------
|                 |
|/ < ^       N    |
   y y       y
|                 |
|                 |
|                 |
|\   @         >  |
     c         y
|                 |
-------------------
`,
    String.raw`
@
c
   
RTurns to right
r

 Turns to leftL
              r

              $
              y
`,
    String.raw`

  F fires neighboring
  r
  v  actor periodically
  p


 $     @
 y     c
#######################
`,
    String.raw`
++++++++++++++++++

 Same_color_text@
 cccccccccccccccc

 is_treated_as
 yyyyyyyyyyyyy

 single_actorN
 ggggggggggggg

++++++++++++++++++
`,
    String.raw`

Character neighboring s
                      c
becomes slow          @
                      c

Character neighboring f
                      b
becomes fast          @
                      b

    s>
    yy
    f>
    gg
`,
    String.raw`
 ################
 #That's all    #
 # @            #
   c
 sWrite your own#
 r
sF>game         #
rrppppp
 #with text     s
                r
 #     tilemap<fFs
       ppppppppprr
 #            $ #
              y 
 ################
`
    /*
  ,String.raw`
`,
*/
  ]
  //{ testingLevel: -1 }
);

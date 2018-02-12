import { SVG_NS, KEYS } from '../settings';
import Paddle from './Paddle';

export default class Ball {

  constructor(radius, boardWidth, boardHeight/*, x, y*/) {
    this.radius = radius;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    // this.x = x; //Will use this later to spawn ball in specific location.
    // this.y = y;
    this.direction = 1;
    this.reset();

    this.ping = new Audio('public/sounds/pong-01.wav');


  } //END OF CONSTRUCTOR

   reset() {
    //Start position
    this.x = this.boardWidth / 2;
    this.y = this.boardHeight / 2;
    
    //Start vector
    this.vy = 0;

    //Prevent ball being trapped in middle of board if vy is set to 0.
    // while( this.vy === 0 ) {
    //   this.vy = Math.floor(Math.random() * 10 - 5);
    // }
    // this.vx = this.direction * (10 - Math.abs(this.vy));
    this.vx = this.direction * 6;
  }

  goal( player ) {
    player.score++;
    // console.log(player.score) 
  }

  wallCollision() {
    const hitLeft = ( this.x - this.radius ) <= 0;
    const hitRight = ( this.x + this.radius ) >= this.boardWidth;
    const hitTop = ( this.y - this.radius ) <= 0;
    const hitBottom = ( this.y + this.radius ) >= this.boardHeight;

      if( hitTop || hitBottom ) {
        this.vy = -this.vy;
      }
      else if ( hitLeft || hitRight ){
        // GOAL RESPONSE
        this.vx = -this.vx;
      }
  }

  paddleCollision( player1, player2 ) {
    
    
    if( this.vx > 0) { //If travelling toward right
      
      let paddle = player2.coordinates( player2.x, player2.y, player2.width, player2.height );
      let [leftX, rightX, topY, bottomY] = paddle;

      if( 
        (this.x + this.radius >= leftX) //Ball right edge is touching or left of Paddle left edge
      && (this.x + this.radius <= rightX) //Ball right edge is touching or left of Paddle right edge
      && (this.y >= topY && this.y <= bottomY) //Ball within Paddle height
      ) 
      {
        this.vx = -this.vx

        //Return angle determined by where it hits the paddle.
        //If ball hits middle 1/3 then normal rebound (mirror angle)
        //If ball hits outer 1/3 then rebound is calculated based on how far from center of paddle the ball hit up to a max of 30degrees

          if ( this.y <= topY + player2.height/3 || this.y >= bottomY - player2.height/3 ) {

            let reboundAngle = 30 * ( ( this.y - (topY + player2.height/2) ) / (player2.height/2) )
            this.vy = Math.abs(this.vx) * Math.tan( reboundAngle * Math.PI/180 );
          }
        
        this.ping.play();
      }

    }
    else {
      let paddle = player1.coordinates( player1.x, player1.y, player1.width, player1.height );
      let [leftX, rightX, topY, bottomY] = paddle;

      if( 
        (this.x - this.radius <= rightX) //Ball left edge is touching or left of Paddle left edge
      && (this.x - this.radius >= leftX) //Ball leftt edge is touching or left of Paddle right edge
      && (this.y >= topY && this.y <= bottomY) //Ball within Paddle height
      ) 
      {
        this.vx = -this.vx;

        //Return angle determined by where it hits the paddle.
        //If ball hits middle 1/3 then normal rebound (mirror angle)
        //If ball hits outer 1/3 then rebound is calculated based on how far from center of paddle the ball hit up to a max of 30degrees

        if ( this.y <= topY + player1.height/3 || this.y >= bottomY - player1.height/3 ) {

          let reboundAngle = 30 * ( ( this.y - (topY + player1.height/2) ) / (player1.height/2) )
          this.vy = Math.abs(this.vx) * Math.tan( reboundAngle * Math.PI/180 );
        }
        this.ping.play();
      }

    }

  }

  render(svg, player1, player2) {

    this.x += this.vx;
    this.y += this.vy;

    this.wallCollision();
    this.paddleCollision( player1, player2 );

    let ball = document.createElementNS(SVG_NS, 'circle');
    ball.setAttributeNS( null, 'cx', this.x );
    ball.setAttributeNS( null, 'cy', this.y );
    ball.setAttributeNS( null, 'r', this.radius );
    ball.setAttributeNS( null, 'fill', 'white' );
    svg.appendChild(ball);    

    const rightGoal = this.x + this.radius >= this.boardWidth;
    const leftGoal = this.x - this.radius <= 0;

    if ( rightGoal ) {
      this.goal( player1 );
      this.direction = -1;
      this.reset();
    } else if ( leftGoal ) {
      this.goal( player2 );
      this.direction = 1;
      this.reset();
    }
    
  }
}
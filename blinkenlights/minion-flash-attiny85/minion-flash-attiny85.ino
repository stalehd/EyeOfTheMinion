
// 12 (RCK)
#define LATCH_PIN 0

//  3 (SER IN)
#define DATA_PIN  1

// 13 (SRCK)
#define CLOCK_PIN 2

#define LATCH_TIME 20

//values to set USICR to strobe out
const unsigned char usi_low = (1<<USIWM0) | (1<<USITC);
const unsigned char usi_high = (1<<USIWM0) | (1<<USITC) | (1<<USICLK);

byte data[] = {
    0b00000001,
    0b00000010,
    0b00000100,
    0b00001000,
    0b00010000,
    0b00100000,
    0b00000000,
};

byte data2[] = {
    0b00000111,
    0b00000000,
    0b00000111,    
    0b00000000,
    0b00000111,
    0b00000000,
    
    0b00111000,
    0b00000000,
    0b00111000,
    0b00000000,
    0b00111000,
    0b00000000,
};

void setup(void)
{
 
  //setup pins for serial
  //  PB2 (SCK/USCK/SCL/ADC1/T0/INT0/PCINT2)
  // 	PB1 (MISO/DO/AIN1/OC0B/OC1A/PCINT1)
  // 	PB0 (MOSI/DI/SDA/AIN0/OC0A/OC1A/AREF/PCINT0) - will not be used as DI
  //	PB0 used as /CS
  DDRB = (1<<DDB0) | (1<<DDB2) | (1<<DDB1);// /CS, USCK and DO as outputs
  //setup serial comms - 3 wire
  USICR = (1<<USIWM0);
  
  pinMode(3, INPUT);
  pinMode(4, INPUT);
}

void sendByte(byte b){
 	//load the byte to the output register
	USIDR = b;
	//strobe USICLK 8 cycles (also toggles clock output thanks to USITC)
	//an unrolled loop gives 50% duty and saves 3 clock cycles per bit sent
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;
	USICR = usi_low;
	USICR = usi_high;			
}

void toggle_pin(int pin, int value) {
    digitalWrite(pin, value);
    delayMicroseconds(LATCH_TIME);
    digitalWrite(pin, (value == HIGH) ? LOW : HIGH);
}

void loop(void)
{
  if (digitalRead(4)) {
    for (int i = 0; i < 7; i++) {
      sendByte(data[i]);
      toggle_pin(LATCH_PIN, HIGH);
      delay(30);
    }
  }
  
  if (digitalRead(3)) {
     for (int i =  0; i < 12; i++) {
        sendByte(data2[i]);
        toggle_pin(LATCH_PIN, HIGH);
        delay(20); 
     }
  }
  
  
  
}

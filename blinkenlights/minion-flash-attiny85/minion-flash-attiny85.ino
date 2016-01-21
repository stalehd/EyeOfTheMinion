/**
 * This code runs on an Attiny85 that is wired to a TPIC6B595 8 bit
 * shift register.  When a bit in the register is set to 1 it will
 * turn on the corresponding LED in the blinkenlights.
 *
 *  - http://www.atmel.com/images/atmel-2586-avr-8-bit-microcontroller-attiny25-attiny45-attiny85_datasheet.pdf
 *  - http://www.ti.com/lit/ds/symlink/tpic6b595.pdf
 *  
 * In order to compile this code you may have to add Attiny85 in the
 * board manager.  Open the Preferences and add this URL to the
 * "Additional Boards Manager URLs": http://drazzy.com/package_drazzy.com_index.json
 * then under
 *
 *    Tools > Boards > Boards Manager
 *
 * You can find the Attiny support.  Set the Board to Attiny x5.
 *
 * To download the firmware to the Attiny85 you have to build a
 * programmer.  For that you basically need an Arduino, a breadboard,
 * resistor, possibly a capacitor etc.  Just Google it.
 *
 * @author borud
 */


// Pins used by the Shift Register TPIC6B595
//
//      Attiny85 Pin |  TPIC6B595 Pin
#define LATCH_PIN 0  //  12 (RCK)
#define DATA_PIN  1  //   3 (SER IN)
#define CLOCK_PIN 2  //  13 (SRCK)

// Number of milliseconds we pull the RCK (Register Clock) high to
// enter the value.
#define LATCH_TIME 20

// If you pull these pins high they will enable the STROBE mode, RUN mode or both in 
#define STROBE_LIGHT_PIN  3
#define RUN_LIGHT_PIN     4


//values to set USICR to strobe out
const unsigned char usi_low = (1<<USIWM0) | (1<<USITC);
const unsigned char usi_high = (1<<USIWM0) | (1<<USITC) | (1<<USICLK);


byte run_light_data[] = {
    0b00000001,
    0b00000010,
    0b00000100,
    0b00001000,
    0b00010000,
    0b00100000,
    0b00000000,
};

byte strobe_light_data[] = {
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

/**
 *
 *
 */
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

  // Make the STROBE_LIGHT_PIN and RUN_LIGHT_PIN inputs.
  //
  pinMode(STROBE_LIGHT_PIN, INPUT);
  pinMode(RUN_LIGHT_PIN, INPUT);
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

/**
 * This function toggles a given pin for LATCH_TIME milliseconds.
 * Used to push the data we have clocked into the shift register to
 * the outputs.
 *
 * @param pin The pin we want to toggle
 * @param value the starting value when we toggle
 */
void toggle_pin(int pin, int value) {
    digitalWrite(pin, value);
    delayMicroseconds(LATCH_TIME);
    digitalWrite(pin, (value == HIGH) ? LOW : HIGH);
}

/**
 * Main loop.
 */
void loop(void) {
    // If STROBE_LIGHT_PIN is pulled high, we run through the
    // STROBE_LIGHT_DATA sequence.
    if (digitalRead(STROBE_LIGHT_PIN)) {
        for (int i =  0; i < 12; i++) {
            sendByte(strobe_light_data[i]);
            toggle_pin(LATCH_PIN, HIGH);
            delay(20); 
        }
    }

    // If the RUN_LIGHT_PIN is pulled high, we run through the RUN_LIGHT_PIN sequence
    if (digitalRead(RUN_LIGHT_PIN)) {
        for (int i = 0; i < 7; i++) {
            sendByte(run_light_data[i]);
            toggle_pin(LATCH_PIN, HIGH);
            delay(30);
        }
    }
}

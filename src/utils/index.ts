// const REFERENCE_LEVEL_FLOAT = 1; // = 0.00002Pa
const MAX_LEVEL_FLOAT = 32767; // = 0.6325Pa
const REFERENCE_LEVEL_PA = 0.00002; // lowest detectable level in Pascal
const MAX_LEVEL_PASCAL = 0.6325; // Max detectable level in pascal
const CALIBRATION_DB_SPL = -20; // Guesswork for now

/**
 * Transforms metering output from expo Audio (-180 - 0) into a 16-bit float value
 * @param {number} metering Negative dbU measurement from expo audio library
 * @returns {Number} Calculated float measurement
 */
export function getMeasurementFromExpoMetering(metering: number) {
  if (metering < -180) {
    // No valid level detected
    return 0;
  }
  const normalisedMeter = 180 + metering;
  const incsPerDb = MAX_LEVEL_FLOAT / 180;
  return normalisedMeter * incsPerDb;
}

/**
 * Calculates the Sound Pressure Level of a 16-bit recorded signal based on the idea that the max amplitude (between 0 and 32767) is relative to the pressure. It is assumed that max detectable SPL will be between 90 and 100dB
 * @param {number} measurement Float level of audio as unsigned 16-bit integer (between 0 and 32767)
 * @returns {Number} Calculated dB SPL reading
 */
export function getDbSplFromAudioMeasurement(measurement: number) {
  if (measurement === 0) {
    // No valid level detected
    return 0;
  }
  const denominator = MAX_LEVEL_FLOAT / MAX_LEVEL_PASCAL;
  const pressure = measurement / denominator;
  const dbSpl = 20 * Math.log10(pressure / REFERENCE_LEVEL_PA);
  return dbSpl + CALIBRATION_DB_SPL;
}

export function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

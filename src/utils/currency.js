/**
 * Centralized localization configuration for Egypt.
 * Maps EGP currency formatting, Egyptian phone structure, and default search cities.
 */

export const CURRENCY_SYMBOL = 'EGP';

export const formatPrice = (amount) => {
  return `${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })} ${CURRENCY_SYMBOL}`;
};

export const PHONE_PLACEHOLDER = '+20 1xx xxxx xxxx';

export const DEFAULT_CITY = 'Cairo';

export const EGYPTIAN_CITIES = [
  'Cairo', 'New Cairo', 'Maadi', 'Zamalek', 'Heliopolis',
  'Giza', '6th of October', 'Sheikh Zayed',
  'Alexandria', 'Mansoura', 'Tanta', 'Hurghada', 'Sahel'
];

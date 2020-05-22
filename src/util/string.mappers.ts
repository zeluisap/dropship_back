import * as moment from 'moment';
import * as numeral from 'numeral';

export const htmlStrong = text => {
  return '<strong>' + text + '</strong>';
};

export const upperCase = text => {
  return text.toUpperCase();
};

export const lowerCase = text => {
  return text.toLowerCase();
};

export const decodeDate = text => {
  return moment(text).format('YYYY-MM-DD');
};

export const decodeDateTime = text => {
  return moment(text).format('YYYY-MM-DD HH:mm:SS');
};

export const encodeNumber = text => {
  if (!text) {
    return text;
  }

  try {
    return numeral(text.replace('.', '').replace(',', '.')).value();
  } catch (error) {
    return text;
  }
};

export const numberDecimal2 = text => {
  if (!text) {
    return text;
  }
  let valor = text;
  if (typeof valor !== 'number') {
    valor = encodeNumber(valor);
  }
  return valor.toFixed(2);
};

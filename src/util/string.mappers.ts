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
    return 0;
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

export const mapperList = [
  {
    name: 'htmlStrong',
    description: 'Envolve o texto em uma tag <strong>.',
  },
  {
    name: 'upperCase',
    description: 'Converte o texto para maiúsculo.',
  },
  {
    name: 'lowerCase',
    description: 'Converte o texto para minúsculo.',
  },
  {
    name: 'decodeDate',
    description: 'Transforma data do formato DD/MM/YYYY para YYYY-MM-DD.',
  },
  {
    name: 'decodeDateTime',
    description:
      'Transforma data e hora do formato DD/MM/YYYY HH:mm:SS para YYYY-MM-DD HH:mm:SS.',
  },
  {
    name: 'encodeNumber',
    description: 'Transforma número para padrão linux.',
  },
  {
    name: 'numberDecimal2',
    description: 'Transforma número para padrão linux com 2 casas decimais.',
  },
];

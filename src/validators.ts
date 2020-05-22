import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as mappers from './util/string.mappers';
import * as _ from 'lodash';

@ValidatorConstraint({ name: 'bancoCodigoValidador', async: false })
export class BancoCodigoValidador implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) {
      return false;
    }

    const match = text.match(/^[0-9]{3}$/g);
    if (match) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Valor do código bancário inválido, apenas 3 números!';
  }
}

@ValidatorConstraint({ name: 'agenciaValidador', async: false })
export class AgenciaValidador implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) {
      return false;
    }

    const match = text.match(/^[0-9]{4}(?:\-[0-9]{1})?$/g);
    if (match) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Valor da Agência inválido!';
  }
}

@ValidatorConstraint({ name: 'contaValidador', async: false })
export class ContaValidador implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) {
      return false;
    }

    const match = text.match(/^([0-9]+)(-[0-9a-zA-Z]{1})$/g);
    if (match) {
      return true;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Valor da Conta inválido!';
  }
}

@ValidatorConstraint({ name: 'arrayNotEmpty', async: false })
export class ArrayNotEmpty implements ValidatorConstraintInterface {
  validate(objs: any[], args: ValidationArguments) {
    if (objs && objs.length) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Lista está vazia!';
  }
}

@ValidatorConstraint({ name: 'isMapper', async: false })
export class IsMapper implements ValidatorConstraintInterface {
  validate(mapper: string, args: ValidationArguments) {
    if (!mapper) {
      return false;
    }

    if (!mappers.hasOwnProperty(mapper)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const mapperNames = _.get(args, 'value');
    if (!(mapperNames && mapperNames.length)) {
      return 'Este mapper não está disponível!';
    }

    const mapper = mapperNames.shift(mapperNames);
    if (!mapper) {
      return 'Este mapper não está disponível!';
    }

    return 'Mapper [' + mapper + '] não está disponível!';
  }
}

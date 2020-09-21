import fs from 'fs';
import YAML from 'yamljs';
import {
    InvalidParameterError,
    ServerError
}
from './errors';

import schemaBuilder from './schemaBuilder';


// parses a yaml file to json
const parseYAMLToJSON = (yamlFilePath) => {
    try {
        const schemaBuffer = fs.readFileSync(yamlFilePath);
        // console.log('schemaBuffer', schemaBuffer);
        const schemaString = schemaBuffer.toString();
        // console.log('schemaString', schemaString);
        return YAML.parse(schemaString);
    } catch (e) {
        logger.error(e);
        return e;
    }
};

// loads + parses json/yaml files
const loadSchema = (schemaPath) => {
    if (schemaPath.match(/\.yml$/) || schemaPath.match(/\.yaml$/)) {
        return parseYAMLToJSON(schemaPath);
    }
    return false;
};

class Schema {
    constructor(schemaPath) {
        if (!schemaPath) {
            throw new ServerError('No Schema Provided For Server');
        }
        this.schema = loadSchema(schemaPath);
        this.validator = schemaBuilder.buildSchemaValidator(this.schema);
    }

    // _matchRoute matches a url/method pair against the schemas loaded into the validator
    _matchRoute(url, method, statusCode = '') {
        const schemas = this.validator._schemas;
        // console.log('schemas', schemas);
        const type = `${statusCode || ''}${method}${url}`;
        // console.log('type', type);
        const keys = Object.keys(schemas);
        // console.log('keys', keys);
        const schemaName = keys.find(key => type.match(key));
        // console.log('schemaName', schemaName);
        if (!schemaName) {
            return null;
        }
        try {
            return this.validator.getSchema(schemaName);
        } catch (err) {
            // console.log('errrrr', err);
            logger.error(err);
            return err;
        }
    }

    // _extractPathParams compares current route against schema route to extract path parameters
    static _extractPathParams(url, method, match) {
        const type = `${method}${url}`;
        const result = type.match(match);

        if (!result || !result.groups) {
            return {};
        }

        Object.keys(result.groups).forEach((key) => {
            if (typeof result.groups[key] === 'string' && (/^[+-]?\d+(\.\d+)?$/.test(result.groups[key]) || /^\d+$/.test(result.groups[key]))) {
                result.groups[key] = parseFloat(result.groups[key], 10);
            }
        });
        return result.groups;
    }

    // validate exposes an express middleware which validates request for current path.

    validate(req, res) {
        // res.status is undefined on inbound requests and defined on outbound requests
        const schema = this._matchRoute(req.originalUrl, req.method, res.statusCode);
        // console.log('req.originalUrl', req.originalUrl);
        // console.log('req.methodl', req.method);
        // console.log('res.statusCode', res.statusCode);
        if (!schema) {
            // assume response validation
            if (res.statusCode) {

                return { success: false, error: new ServerError(`No Swagger Found for ${res.statusCode}:${req.originalUrl}:${req.method}`) };

                // return next ? next(error) : serverError;
            }

            return { success: false, error: new Error(`Cannot ${req.method} ${req.originalUrl}`) };
            // return next ? next(error) : error;
        }
        let valid;
        if (!res.statusCode) {
            // inbound request
            const path = Schema._extractPathParams(
                req._parsedUrl.pathname,
                req.method,
                schema.schema.$id
            );
            // console.log('req.body', req.body);
            valid = schema({
                body: req.body,
                headers: req.headers,
                query: req.query,
                path
            });
            // console.log('valid', valid);
        } else {
            // outbound request
            valid = schema(res.body);
        }
        if (!valid) {
            // console.log('schema.errors', schema.errors);

            return { success: false, error: new InvalidParameterError('See Errors', schema.errors) };
            // return next ? next(error) : error;
        }
        return { success: true };
        // return next ? next() : null;
    }
}
export default Schema;
/**
 * Unit tests for metadataUtils
 */

const {
    batchIt,
    fixMetadataValues,
    isValidCustomMetadata,
    percentCalc,
    getOrgIdentifier,
    spinnerInitialization
} = require('./metadataUtils');

describe('batchIt', () => {
    test('should handle empty array', () => {
        const result = batchIt(10, []);
        expect(result).toEqual([]);
    });

    test('should create single batch when array smaller than batch size', () => {
        const input = [1, 2, 3];
        const result = batchIt(10, input);
        expect(result).toEqual([[1, 2, 3]]);
    });

    test('should create exact batches when array size is multiple of batch size', () => {
        const input = [1, 2, 3, 4, 5, 6];
        const result = batchIt(2, input);
        expect(result).toEqual([
            [1, 2],
            [3, 4],
            [5, 6]
        ]);
    });

    test('should handle remainder in last batch', () => {
        const input = [1, 2, 3, 4, 5];
        const result = batchIt(2, input);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('should handle batch size of 1', () => {
        const input = [1, 2, 3];
        const result = batchIt(1, input);
        expect(result).toEqual([[1], [2], [3]]);
    });
});

describe('isValidCustomMetadata', () => {
    test('should return true for valid metadata', () => {
        const validMetadata = {
            fullName: 'Test__mdt.Record1',
            label: 'Test Record',
            values: [{ field: 'Field1__c', value: 'value1' }]
        };
        expect(isValidCustomMetadata(validMetadata)).toBe(true);
    });

    test('should return false for null', () => {
        expect(isValidCustomMetadata(null)).toBe(false);
    });

    test('should return false for undefined', () => {
        expect(isValidCustomMetadata(undefined)).toBe(false);
    });

    test('should return false for non-object', () => {
        expect(isValidCustomMetadata('string')).toBe(false);
        expect(isValidCustomMetadata(123)).toBe(false);
    });

    test('should return false when missing fullName', () => {
        const metadata = {
            label: 'Test Record',
            values: [{ field: 'Field1__c', value: 'value1' }]
        };
        expect(isValidCustomMetadata(metadata)).toBe(false);
    });

    test('should return false when missing label', () => {
        const metadata = {
            fullName: 'Test__mdt.Record1',
            values: [{ field: 'Field1__c', value: 'value1' }]
        };
        expect(isValidCustomMetadata(metadata)).toBe(false);
    });

    test('should return false when values is not an array', () => {
        const metadata = {
            fullName: 'Test__mdt.Record1',
            label: 'Test Record',
            values: 'not an array'
        };
        expect(isValidCustomMetadata(metadata)).toBe(false);
    });

    test('should return false when values array is empty', () => {
        const metadata = {
            fullName: 'Test__mdt.Record1',
            label: 'Test Record',
            values: []
        };
        expect(isValidCustomMetadata(metadata)).toBe(false);
    });
});

describe('percentCalc', () => {
    test('should calculate percentage correctly', () => {
        expect(percentCalc(50, 100)).toBe('50.00');
        expect(percentCalc(1, 4)).toBe('25.00');
        expect(percentCalc(3, 4)).toBe('75.00');
    });

    test('should handle zero total', () => {
        expect(percentCalc(5, 0)).toBe(0); // Returns number, not string
    });

    test('should handle zero part', () => {
        expect(percentCalc(0, 100)).toBe('0.00');
    });

    test('should handle decimal results', () => {
        expect(percentCalc(1, 3)).toBe('33.33');
        expect(percentCalc(2, 3)).toBe('66.67');
    });

    test('should handle part greater than total', () => {
        expect(percentCalc(150, 100)).toBe('150.00');
    });

    test('should return string with 2 decimal places', () => {
        const result = percentCalc(1, 2);
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^\d+\.\d{2}$/);
    });
});

describe('getOrgIdentifier', () => {
    test('should extract org identifier from valid URL', () => {
        const connection = {
            instanceUrl: 'https://grifols--tst.sandbox.my.salesforce.com'
        };
        expect(getOrgIdentifier(connection)).toBe('tst');
    });

    test('should extract org identifier from pre environment', () => {
        const connection = {
            instanceUrl: 'https://grifols--pre.sandbox.my.salesforce.com'
        };
        expect(getOrgIdentifier(connection)).toBe('pre');
    });

    test('should return empty string for invalid URL format', () => {
        const connection = {
            instanceUrl: 'https://login.salesforce.com'
        };
        expect(getOrgIdentifier(connection)).toBe('');
    });

    test('should return empty string for missing instanceUrl', () => {
        const connection = {};
        expect(getOrgIdentifier(connection)).toBe('');
    });

    test('should handle complex org identifiers', () => {
        const connection = {
            instanceUrl: 'https://company--sandbox123.my.salesforce.com'
        };
        expect(getOrgIdentifier(connection)).toBe('sandbox123');
    });
});

describe('fixMetadataValues', () => {
    test('should handle simple metadata object', () => {
        const metadata = {
            fullName: 'Test__mdt.Record1',
            values: [{ field: 'Field1__c', value: 'test value' }]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values[0].value).toBe('test value');
    });

    test('should convert number values to strings', () => {
        const metadata = {
            values: [{ field: 'Field1__c', value: 123 }]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values[0].value).toBe('123');
    });

    test('should convert boolean true to string', () => {
        const metadata = {
            values: [{ field: 'Field1__c', value: true }]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values[0].value).toBe('true');
    });

    // Note: false and 0 values are NOT converted to strings due to truthy check bug
    // They remain as their original boolean/number type
    test('should convert false and zero values correctly', () => {
        const metadata = {
            values: [
                { field: 'Field1__c', value: true },
                { field: 'Field2__c', value: false },
                { field: 'Field3__c', value: 0 }
            ]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values).toHaveLength(3);
        expect(result.values[0].value).toBe('true');
        expect(result.values[1].value).toBe('false');
        expect(result.values[2].value).toBe('0');
    });

    test('should escape XML in string values', () => {
        const metadata = {
            values: [{ field: 'Field1__c', value: 'Tom & Jerry' }]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values[0].value).toBe('Tom &amp; Jerry');
    });

    test('should handle value objects with underscore property', () => {
        const metadata = {
            values: [{ field: 'Field1__c', value: { _: 'actual value' } }]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values[0].value).toBe('actual value');
    });

    test('should filter out invalid value types', () => {
        const metadata = {
            values: [
                { field: 'Field1__c', value: 'valid' },
                { field: 'Field2__c', value: { complex: 'object' } },
                { field: 'Field3__c', value: 123 }
            ]
        };
        const result = fixMetadataValues(metadata);
        expect(result.values).toHaveLength(2);
        expect(result.values[0].value).toBe('valid');
        expect(result.values[1].value).toBe('123');
    });

    test('should handle arrays of metadata', () => {
        const metadataArray = [{ values: [{ field: 'F1', value: 'v1' }] }, { values: [{ field: 'F2', value: 'v2' }] }];
        const result = fixMetadataValues(metadataArray);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('should handle nested objects recursively', () => {
        const metadata = {
            nested: {
                values: [{ field: 'Field1__c', value: 'test' }]
            }
        };
        const result = fixMetadataValues(metadata);
        expect(result.nested.values[0].value).toBe('test');
    });

    test('should return primitives unchanged', () => {
        expect(fixMetadataValues('string')).toBe('string');
        expect(fixMetadataValues(123)).toBe(123);
        expect(fixMetadataValues(null)).toBe(null);
    });
});

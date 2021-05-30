const mocks = require('./src/mocks')
// Establish API mocking before all tests.
beforeAll(() => mocks.server.listen())
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => mocks.server.resetHandlers())
// Clean up after the tests are finished.
afterAll(() => mocks.server.close())

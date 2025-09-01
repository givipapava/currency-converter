# Currency Converter API

A Node.js currency converter application built with NestJS and TypeScript that fetches exchange rates from the Monobank API.

## Features

- Real-time currency conversion via Monobank API
- Cross-currency support
- Redis caching with configurable TTL
- Error handling with retry mechanisms

## Architecture

Uses Repository pattern for data access and Strategy pattern for different conversion types.


## Installation

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose

### Setup

1. Clone repository:
   ```bash
   git clone https://github.com/givipapava/currency-converter
   cd currency-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

API available at `http://localhost:3000`

## API Documentation

### Convert Currency
`POST /currency/convert`

**Request:**
```json
{
  "from": "USD",
  "to": "EUR", 
  "amount": 100
}
```

**Response:**
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "convertedAmount": 86.26,
  "rate": 0.8626,
  "timestamp": "2025-09-01T14:09:11.977Z"
}
```

### Get Supported Currencies
`GET /currency/supported`

**Response:**
```json
{
  "currencies": [
    "AUD", "BGN", "CAD", "CHF", "CZK", "DKK", 
    "EUR", "GBP", "HRK", "HUF", "JPY", "NOK", 
    "PLN", "RON", "SEK", "TRY", "UAH", "USD"
  ]
}
```

### Get Exchange Rates  
`GET /currency/rates`

**Response:**
```json
{
  "rates": [
    {
      "from": "USD",
      "to": "UAH",
      "rate": 41.4903,
      "lastUpdated": "2025-09-01T06:20:06.000Z"
    },
    {
      "from": "EUR",
      "to": "UAH", 
      "rate": 48.771,
      "lastUpdated": "2025-09-01T06:20:06.000Z"
    }
  ]
}
```

### Health Check
`GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-01T14:09:11.867Z",
  "services": {
    "redis": "healthy"
  }
}
```

## Development

```bash
npm run start:dev    # Development
npm run build        # Build
npm run test         # Tests
npm run lint         # Linting
```

## API Testing Examples

### Basic Currency Conversion
```bash
# USD to EUR
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "USD", "to": "EUR", "amount": 100}'

# USD to Ukrainian Hryvnia  
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "USD", "to": "UAH", "amount": 50}'

# Cross-currency conversion (EUR to GBP via UAH)
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "EUR", "to": "GBP", "amount": 200}'
```

### Get Available Information
```bash
# Health check
curl http://localhost:3000/health

# Supported currencies
curl http://localhost:3000/currency/supported

# Current exchange rates
curl http://localhost:3000/currency/rates
```

### Error Testing
```bash
# Invalid currency code
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "INVALID", "to": "EUR", "amount": 100}'

# Negative amount
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "USD", "to": "EUR", "amount": -50}'
```

### With Pretty Output (using jq)
```bash
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "USD", "to": "EUR", "amount": 100}' | jq .
```

## Production

```bash
docker build -t currency-converter .
docker run -d -p 3000:3000 currency-converter
```
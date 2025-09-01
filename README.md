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

```json
{
  "from": "USD",
  "to": "EUR", 
  "amount": 100
}
```

### Get Supported Currencies
`GET /currency/supported`

### Get Exchange Rates  
`GET /currency/rates`

### Health Check
`GET /health`

## Development

```bash
npm run start:dev    # Development
npm run build        # Build
npm run test         # Tests
npm run lint         # Linting
```

## Testing

```bash
curl -X POST http://localhost:3000/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"from": "USD", "to": "EUR", "amount": 100}'
```

## Production

```bash
docker build -t currency-converter .
docker run -d -p 3000:3000 currency-converter
```
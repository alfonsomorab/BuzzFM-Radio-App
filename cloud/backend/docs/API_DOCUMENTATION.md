# 📚 API Documentation Guide

This guide explains how to use, maintain, and update the API documentation for the Radio Streaming Management Platform.

## 📖 Documentation Format

We use **OpenAPI 3.0.3** (formerly Swagger) specification for API documentation. This provides:
- ✅ Industry-standard format
- ✅ Interactive documentation with Swagger UI
- ✅ Code generation capabilities
- ✅ API testing interface
- ✅ Type safety and validation

## 🌐 Viewing API Documentation

### Local Development

**Start the development server:**
```bash
npm run dev
```

**Access the documentation:**
```
http://localhost:3000/api-docs
```

You'll see an interactive Swagger UI interface where you can:
- Browse all endpoints
- View request/response schemas
- Test API calls directly
- See authentication requirements
- Download the OpenAPI specification

### Production

Once deployed, access documentation at:
```
https://your-domain.com/api-docs
```

## 📁 Documentation Files

### Main OpenAPI Specification
**File:** `openapi.yaml`
**Location:** `/cloud/backend/openapi.yaml`

This is the source of truth for all API documentation. It defines:
- All API endpoints
- Request/response schemas
- Authentication methods
- Error responses
- Examples

**Also copied to:** `public/openapi.yaml` (served to Swagger UI)

### Swagger UI Page
**File:** `src/app/api-docs/page.tsx`

Next.js page that renders the interactive Swagger UI.

## ✏️ Updating API Documentation

### When to Update

Update the OpenAPI specification whenever you:
- ✅ Add new API endpoints
- ✅ Modify existing endpoints
- ✅ Change request/response schemas
- ✅ Add/remove query parameters
- ✅ Update authentication methods
- ✅ Change error responses

### How to Update

#### 1. Edit OpenAPI Specification

**File:** `openapi.yaml`

**Add a new endpoint:**
```yaml
paths:
  /api/your/new/endpoint:
    get:
      tags:
        - Your Tag
      summary: Brief description
      description: Detailed description
      operationId: uniqueOperationName
      security:
        - ApiKeyAuth: []  # or SessionAuth: []
      parameters:
        - name: paramName
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Success response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/YourSchema'
```

**Add a new schema:**
```yaml
components:
  schemas:
    YourSchema:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          example: "Example name"
```

#### 2. Copy to Public Folder

After editing `openapi.yaml`, copy it to the public folder:

```bash
cp openapi.yaml public/openapi.yaml
```

Or use the npm script:
```bash
npm run docs:update
```

#### 3. Validate the Specification

**Online Validator:**
```bash
# Visit: https://editor.swagger.io/
# Paste your openapi.yaml content
# Check for errors
```

**CLI Validator (optional):**
```bash
# Install Swagger CLI
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate openapi.yaml
```

#### 4. Test Locally

```bash
npm run dev
# Visit http://localhost:3000/api-docs
# Verify your changes appear correctly
```

## 🏷️ API Organization

### Tags (Categories)

Endpoints are organized into tags:
- **Public Mobile API** - Mobile app endpoints
- **Admin - Stations** - Station management
- **Admin - Payments** - Payment tracking
- **Admin - Emails** - Email notifications
- **Station - Programs** - Program schedules
- **Station - Analytics** - Analytics data
- **Station - Branding** - Branding updates

### Authentication Schemes

Two authentication methods:
1. **ApiKeyAuth** - Bearer token for mobile apps
2. **SessionAuth** - Cookie-based session for web dashboards

## 📝 Documentation Best Practices

### 1. Complete Descriptions
Always provide:
- Clear, concise summaries
- Detailed descriptions
- Usage examples
- Edge cases and limitations

### 2. Comprehensive Schemas
Define schemas with:
- All required fields marked
- Data types and formats
- Validation rules (min, max, pattern)
- Example values

### 3. Response Examples
Include examples for:
- Success responses (200, 201)
- Error responses (400, 401, 403, 404, 500)
- Different scenarios

### 4. Consistent Naming
- Use camelCase for property names
- Use clear, descriptive operation IDs
- Tag names should match features

### 5. Security Documentation
- Specify authentication requirements for each endpoint
- Document permission levels (admin, station user)
- Include security notes in descriptions

## 🧪 Testing APIs via Documentation

The Swagger UI allows testing APIs directly:

### 1. Authenticate

**For API Key endpoints:**
1. Click "Authorize" button
2. Enter API key: `Bearer sk_live_your_api_key`
3. Click "Authorize"

**For Session endpoints:**
1. Login to application first
2. Cookie will be automatically sent

### 2. Try Endpoint

1. Expand the endpoint
2. Click "Try it out"
3. Fill in parameters/body
4. Click "Execute"
5. View response

## 📊 Example Endpoint Documentation

Here's a well-documented endpoint example:

```yaml
/api/admin/stations:
  post:
    tags:
      - Admin - Stations
    summary: Create new station
    description: |
      Registers a new radio station with the platform.

      **Features:**
      - Auto-generates unique API key
      - Creates station slug from name
      - Sets default status to 'active'

      **Permissions:** Admin only

      **Returns:** Station object with API key (only returned once)
    operationId: createStation
    security:
      - SessionAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateStationRequest'
          example:
            name: "Magic FM 95.7"
            contactEmail: "contact@magicfm.com"
            streamUrlPrimary: "https://stream.magicfm.com/live"
            branding:
              primaryColor: "#FF5733"
    responses:
      '201':
        description: Station created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                station:
                  $ref: '#/components/schemas/RadioStation'
                apiKey:
                  type: string
                  description: Generated API key (only shown once)
                  example: "sk_live_abc123xyz789..."
            example:
              station:
                id: "123e4567-e89b-12d3-a456-426614174000"
                name: "Magic FM 95.7"
                slug: "magic-fm"
                status: "active"
              apiKey: "sk_live_abc123xyz789..."
      '401':
        $ref: '#/components/responses/UnauthorizedError'
      '403':
        $ref: '#/components/responses/ForbiddenError'
      '400':
        description: Invalid request data
        content:
          application/json:
            example:
              error: "Bad Request"
              message: "Station with this email already exists"
              statusCode: 400
```

## 🔄 Keeping Documentation in Sync

### Manual Sync
Every time you implement/modify an API endpoint:
1. Update the implementation
2. Update `openapi.yaml`
3. Copy to public folder
4. Test in Swagger UI
5. Commit both files together

### Automated Sync (Future Enhancement)
Consider adding:
- TypeScript types generated from OpenAPI spec
- API route validators from spec
- Automated tests from examples
- CI/CD validation checks

## 🚀 Code Generation

OpenAPI specifications can generate:

### Client SDKs
```bash
# Generate TypeScript client
npm install -g openapi-generator-cli
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./generated/client
```

### Server Stubs
```bash
# Generate Next.js API stubs
openapi-generator-cli generate \
  -i openapi.yaml \
  -g nodejs-express-server \
  -o ./generated/server
```

### Type Definitions
```bash
# Generate TypeScript types
npm install -g openapi-typescript
openapi-typescript openapi.yaml --output types/api.ts
```

## 📦 NPM Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "docs:update": "cp openapi.yaml public/openapi.yaml",
    "docs:validate": "swagger-cli validate openapi.yaml",
    "docs:serve": "npm run dev"
  }
}
```

## 🌍 Alternative Documentation Tools

While we use Swagger UI, other options include:

### Redoc
```bash
npm install redoc
# Create separate page with Redoc component
```

### Stoplight Elements
```bash
npm install @stoplight/elements
# Beautiful alternative UI
```

### Postman
- Import `openapi.yaml` into Postman
- Create collection from spec
- Share with team

## 📚 Resources

- **OpenAPI 3.0 Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **Swagger Editor**: https://editor.swagger.io/
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Best Practices**: https://swagger.io/docs/specification/about/

## ✅ Documentation Checklist

Before committing API changes:

- [ ] Updated `openapi.yaml` with new/modified endpoints
- [ ] Copied to `public/openapi.yaml`
- [ ] Added complete request/response schemas
- [ ] Included example values
- [ ] Documented authentication requirements
- [ ] Added error responses
- [ ] Validated specification (no errors)
- [ ] Tested in Swagger UI locally
- [ ] Updated this guide if needed
- [ ] Committed both implementation and docs

---

**Built with ❤️ for the radio streaming community**

*Keep your API documentation up to date for better developer experience!*

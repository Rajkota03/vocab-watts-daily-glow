
# Today's Words API Endpoint

This endpoint provides users' daily vocabulary words for the GlintUp application.

## Endpoint Details

- **URL**: `https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/today_words`
- **Method**: `GET`
- **Authentication**: API Key (passed in `x-api-key` header)

## Request Parameters

| Parameter | Type   | Required | Description         |
|-----------|--------|----------|---------------------|
| userId    | string | Yes      | User's unique ID    |

## Response Format

```json
{
  "nickname": "User's nickname",
  "words": ["word1", "word2", "word3", "word4", "word5"],
  "defs": ["definition1", "definition2", "definition3", "definition4", "definition5"],
  "examples": ["example1", "example2", "example3", "example4", "example5"]
}
```

## Error Responses

| Status Code | Description                           |
|-------------|---------------------------------------|
| 400         | Missing required parameters           |
| 401         | Invalid or missing API key            |
| 404         | User not found                        |
| 500         | Server error or data retrieval error  |

## Integration with Aisensy

To integrate with Aisensy Studio:
1. Use the HTTP Request block in Aisensy Studio
2. Set the URL to the endpoint with the user's ID as a query parameter
3. Add the `x-api-key` header with your API key
4. Parse the JSON response to extract the vocabulary words and definitions

## Security Considerations

- The API requires an API key for authentication
- The API key should be stored securely in Aisensy and not exposed to end users
- Each request is validated to ensure the user exists before returning data

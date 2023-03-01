## gpt-based-extractor
gpt-based-extractor is the first layer of `gail-cp-solver` that uses the GPT3 model to extract relevant information from text and identify variables, constraints, and domains to create a CP model and solve it.

### Usage
To use it, make an API call to `/api/v0/data-extraction` and pass the text as a JSON object with the text field. For example:

```
{
    "text": "On doit acheter tois objets A, B, C. On dispose d'un budget de 1000$. Le prix de A doit etre different de celui de B. Le prix de A doit être different de celui de C. Le prix de B doit etre different de celui de C. Le prix de A doit etre superieur a celui de B. Le total dépensé pour l'achat ne doit depasser le budget! Le double de A oté du triple de B doit etre inferieur a 50. Le double de A plus B doit etre different du prix de C."
}
```

### Ouput
The application will return a JSON object with the extracted data in the following format:

```json
{
  "status": "success",
  "data": {
    "variables": [
      {
        "id": "1",
        "name": "A",
        "type": "Integer",
        "domain_type": "INTERVAL",
        "domain_values": [
          "[0,1000]"
        ]
      }
    ],
    "constraints": [
      {
        "left_part": [
          [
            1,
            "Var_1"
          ]
        ],
        "metric": "!=",
        "right_part": [
          [
            1,
            "Var_2"
          ]
        ]
      }
    ]
  }
}
```
### Dependencies
OpenAI GPT-3 API
xml2js
Express

### Installation
* Clone this repository.
* Install dependencies using npm:
```bash
npm i
```
* Set your OpenAI API key as an environment variable named OPENAI_API_KEY.
* Run the application using the following command:
```bash
npm debug
```
* The application will now be running at http://localhost:3001.

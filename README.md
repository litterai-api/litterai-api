# litterai-api

## Authorization Endpoints

### Register User

This endpoint will create a user document and a photo category document which stores the value of each category of trash determined by the AI based on the photo uploaded by the user.

**POST** `/register`

JSON Request body should follow

```
{
  "username": <string>,
  "email": <string>,
  "password": <string>,
  "confirmPassword": <string>,
  "firstName": <string>,
  "lastName": <string>,
  "zipCode": <string>
}
```

<details>
<summary>Response</summary>

```
{
  "userId": <string>,
  "username": <string>,
  "firstName": <string>,
  "lastName": <string>,
  "zipCode": <string>,
  "token": <string>
}
```

</details>

### Login

**POST** `/login`

JSON Request body should follow

```
{
	"email": <string>,
	"password": <string>
}
```

<details>
<summary>Response</summary>

```
{
  "username": <string>,
	"email": <string>,
	"firstName": <string>,
	"lastName": <string>,
	"zipCode": <string>,
	"token": <string>,
}
```

</details>

### Logout

**POST** `/logout`

Include user's JWT in an authorization header

```
Authorization: Bearer <token>
```

## Leaderboard endpoints

### Add Photo info

After a photo has had its contents parsed by the AI send a request to this endpoint in order to have their photo information stored for the leaderboard

**POST** `/photo`

Include user's JWT in an authorization header

```
Authorization: Bearer <token>
```

JSON Request body should follow

```
{
  "category": <string>,
  "email": <string>
}
```

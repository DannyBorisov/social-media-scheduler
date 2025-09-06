Feature:
User login and auth on both client and server.

Development plan:
use firebase to authenticate users in the app. utilize it both on client and server.
on the client side, configure the sdk of firebase (install it with npm)
on server, first init an express app and then create firebase admin sdk.
as you dont have the keys right now, just use XXXXX in both .env on background env .env in front (its vite so you can use .env file with VITE_ prefix)

Also, create a simple login page just to test that the flow is working an everything is in place.

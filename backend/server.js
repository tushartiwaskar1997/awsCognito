import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

function generateSecretHash(username) {
  return crypto
    .createHmac("SHA256", process.env.CLIENT_SECRET)
    .update(username + process.env.CLIENT_ID)
    .digest("base64");
}
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password);

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: generateSecretHash(username)
      }
    });

    const response = await client.send(command);
    console.log("Cognito response:", response);

    res.json(response.AuthenticationResult);
  } catch (err) {
    console.error("Cognito login error:", err);
    res.status(400).json({ error: err.name, message: err.message });
  }
});
app.listen(5000, () => console.log("Server running on port 5000"));




/**
 * AccessToken
: 
"eyJraWQiOiJjM2ZiZTVkNXplRExYbldtZDRSem1XcDBmQUlIQzRIMDkyXC83OGtXczFhcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI4NDY4YzQzOC1lMGExLTcwMjItOTI2YS00ZTgyMzZjNmEyZTgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9Yd0NkRjNaeGYiLCJjbGllbnRfaWQiOiI3Yzg2ZWs2bmprbWdiYXM5dHF2YnM5MWlocCIsIm9yaWdpbl9qdGkiOiI1OGQ4MTgwMy0wMjRhLTRlYzItYmY3Yy04ZmVlZTA3OTczODEiLCJldmVudF9pZCI6ImE2ZTczOWQzLTMwNWUtNDI3OS05MWVkLWFhZTZhNDBhZDFlMiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3NzA5NzYzNTgsImV4cCI6MTc3MDk3OTk1OCwiaWF0IjoxNzcwOTc2MzU4LCJqdGkiOiI2NmJhYzZmYy1mMDVmLTRiMjctYWUwZi04YWEzMjJjOWUyYzkiLCJ1c2VybmFtZSI6InRlc3QxIn0.QqalyGxOHxNVdzgGhpwsUy8q8VG0pCPYxBJ8B8g6GCamhb1g7zkoPncgPcRhgb6wJ_P9sn7WFLL6YWp7AO4YbSZj_cOpTJtnAeQaeAu7KNsEZxBq2BOy8myqiPETXRUPXhroJsmxQUCcJspZMG_9piz-ZT3aDXudl6_I30Xuh9IBINzKprqNopnMrpigw9V9M8TmL0qpsl34CMis2bIxyPrbLURKqw5D3Z6UygErow89rAB-2U_RhCpsJsOV_PB561IYFhZdBbQ48ImRZxqA3LcADmVCC927HyF9esDvmGsLydOKVM6fnqMFLkBrFk_KulgtYEi_mGTSDDtQFnOHmw"
ExpiresIn
: 
3600
IdToken
: 
"eyJraWQiOiJNN0VaSnRKcTBybXpwdjdMbXBcL2lvTkRmSHFsczQ3TFhOWXN5OEVWXC91bjQ9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI4NDY4YzQzOC1lMGExLTcwMjItOTI2YS00ZTgyMzZjNmEyZTgiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMTk5Ny0wOC0xMiIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX1h3Q2RGM1p4ZiIsImNvZ25pdG86dXNlcm5hbWUiOiJ0ZXN0MSIsIm9yaWdpbl9qdGkiOiI1OGQ4MTgwMy0wMjRhLTRlYzItYmY3Yy04ZmVlZTA3OTczODEiLCJhdWQiOiI3Yzg2ZWs2bmprbWdiYXM5dHF2YnM5MWlocCIsImV2ZW50X2lkIjoiYTZlNzM5ZDMtMzA1ZS00Mjc5LTkxZWQtYWFlNmE0MGFkMWUyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NzA5NzYzNTgsImV4cCI6MTc3MDk3OTk1OCwiaWF0IjoxNzcwOTc2MzU4LCJqdGkiOiI4ZTI5MGViYS1jNzJiLTQyZTctYTEwYi03OWM4ODQ0MjQyNzIiLCJlbWFpbCI6InR1c2hhcnRpd2Fza2FyLnN2cGNldEBnbWFpbC5jb20ifQ.pz-IgtBHsMTog7Q3YFWDqZAaT7KfX0_F9qauBDipWuYY2Z1FzdUm0dUm9ND0Lvt3v0JLt2YOG7S9KN7viKsRyISj-yP8-SAPB1y7QKok5I_SSRpCAD7_iqhWyXz6kxZnM2yNlyga1e11LhUeS1BHdBSHI0-LR5UdxcV2P5dYSY0N08yQ3P8qAPtANQqGfWqvI_TmQc0Xrx3aNK2ldDkpjKEpNt61R9D0sRETqvBrp3BeKmi0dRhqV1LVoET1vwGvc0DDZ-4l56h6M6KfFYZZt1DieSaOM-oTU-xCS9Fh5H8BP_2R4P_QTmOYJc2mlZsymybdg6SiNKrUNb1jL7VYgA"
RefreshToken
: 
"eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.nU71_2Km2KgOTtuV_HN1PKSV8AkBY79PAqMPpqz_1oaUotZzisD_BmLO3WPYGX2o3oWxrofceONWerRjsPEpCSk__as-a4vHDB3TDiL6fQnHbhu2Ml2SmBOVK9cgn1Q9JiI91nc6HlSX3Oy8FyDdpOq2QEM2P-scj5gAg8mLIEVeTFrWT7vM6c3_XhmTW_osaFODdYSgp4zqkpGTciGAwNif1mYR5Ety7_Y_-Jwtb0Wt34MmxJc6mbxtamTpcpq0pL-7LkaOU7PHwoQfPzkKj9gOKI8Dk_uf8zLrB56UjDrFrx5PtLtWKsNqW9cewgDVTo7Vet1YMMCXIF0BUjS0LQ.1GkMqIsY1n6ZLwYK.BaEhdFP3acsM9DqFT2khGS3DZoO8tihQSd1RbWP86Ybse6h3o3uA6GWz6-bLCndz23LLUO-TnCzEQlI7Y12389MZ7dM--6pQ7cqz7SFogJ5dyEYJHiRKZT6xJ4pduUC1qL2gG8CG_C_0Hs987bwvIyb8Ni-PL7LohBPHw0w7A-KqlYlOUbkgufHMKiUADm-Teeq9V3o8IT6mPlVVcJAjrKoBSM5lo60TiFMcMAZK4BNRuDoE0nvUJylLISJplPrv3m_sD6PRUfY7qUB1a6hUrnePv1sbMrCcO2Lg8QITiWP7fMCPOWI1PiQBHOsya5apU5PkmqXEfwCiGpowstAKgRWuT15Hy1QUcjVuiEbXUDzHoDKBLIDPkD0aT5wW8pCU-SDxkE781f3FGS_5c12VSlTX5wDkt039F-IOt_4sCP8jp1GzWhcworGQKepZSwXdzLYJA5_y0COoJpCePQGOwX-DM3lsVF3TBdkrjPj7ykqf5SqFQ161R7cz_WBJM7rEmOui3RJpTkgp94UBESfUouCktZYJCain9acBNVjq3AksEYO9o4gAvMHPpGDIr6LBaVDOn5dciNPAABNPalDAeAZbsbBQVjo_5PQXS5Lhn2Et6zGEzl5hQjG_rQ0L6AtluMlv1SOwvLxG5WXy5Ufs2fEmrIdffOlu-oboF_Skg_ptnr62bz-wrARIU7VFW6FsAYgmfQak8SPntsnCmiYwPjVxp-3JLPDlp9Qs0q3SRRVWc9lUBQmnojNAjpEmUy52vEAgK3GGnv6snFu4zXhU7cWQxuuEf0a4hoe-y30pyVJfhisE3tWF0X3iSb_Gns3qlNSWwTmmuOQVSVJ_9RivxWSyoruMSp2qLngxpfhW20TTzG7QzevYOlRQrmAzHWWWF3XWtJAyMZvETie-HlzkaSOrnTCMXEdl3ipuxDEtQjx3es7w_3dJXWmxP-6rtxUMDUZm_oaEfouwCwwghmnxsnsTM-yvAhv0lXV6bbUpoX5zsNASE_9WixG2Rzdi-pElBwK2OV3fipwiZoK9PZw_aizDKXFiSjZ3Ah-0HSfATIsstWL3GhjX3vswk6Yqr28iv500v0CdEtujswOrnLHq-Fuau-pc2Q_2-R5lcdP3fQxsUI3sIaoXJ9LKIHJfk8xfty117t9hlWYpU5kUuj-XcswIDvgnMyZqBDVpXfhIbUmI1qVOMdfagbVQFzMGjiAspl8FBm3aXXzFwwc-zdWgFMqAg2PmaloBv3pmhs4ndRG9Lk_YiyiC_Zjpd84NW-U8sSw.oYNlyA1Lzufvt3GU6gP5mQ"
TokenType
: 
"Bearer"
 */
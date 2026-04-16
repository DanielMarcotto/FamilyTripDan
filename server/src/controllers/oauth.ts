import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";


const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

export async function verifyAppleIdentityToken(token: string): Promise<any> {
  const decodedHeader: any = jwt.decode(token, { complete: true });
  if (!decodedHeader) throw new Error("Invalid token");

  const kid = decodedHeader.header.kid;
  const alg = decodedHeader.header.alg;

  const key = await getAppleSigningKey(kid);

  const payload = jwt.verify(token, key, {
    algorithms: [alg],
  });

  return payload;
}

function getAppleSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      if (!key) return reject(new Error("Signing key not found"));
      const signingKey = key.getPublicKey();
      resolve(signingKey);
    });
  });
}
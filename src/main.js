import { Client,Databases,Query,Account } from 'node-appwrite';
import axios from 'axios';
import nacl from 'tweetnacl';
//import { encodeBase64 } from 'tweetnacl-util';
import sodium from "sodium-native";
import dotenv from "dotenv";
dotenv.config();
export default async ({ req, res, log, error }) => {
  try {

    // the body contains details of the document created
      const collectionId = req.body.$collectionId;
      const documentId=req.body.$id;
      const databaseId=req.body.$databaseId;
      // const keyPair = nacl.sign.keyPair();
 
      // // Convert key pair to base64 encoded strings
      // const publicKeyBase64 = nacl.encodeBase64(keyPair.publicKey);
      // const secretKeyBase64 = nacl.encodeBase64(keyPair.secretKey);

      // log("publickey:  "+publicKeyBase64);
      // log("pirivatekey:  "+secretKeyBase64);
      // Initialize Appwrite client
      const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
          .setKey(process.env.APPWRITE_API_KEY)
          
      const databases = new Databases(client);
  //     const account = new Account(client);
  //     //const response = await externalClient.account.get();
  //     const response = await account.get();
  //      log("response",response)
  //  // Get organization ID from the response
  //      const organizationId = response.result.organizations[0].$id;
   
  //  log('Organization ID:', organizationId);




      // Get documents from the specified collection with name "adi"
      // const allDocuments = await databases.listDocuments(
      //     process.env.APPWRITE_FUNCTION_DATABASE_ID, 
      //     collectionId, 
      //     [
      //       Query.equal('name', ['adi'])
           
      //   ]
      // );
  
        await databases.updateDocument(
              databaseId, 
              collectionId,
              documentId,
              { status: "txn commited" }
          );
           
        const documentDetails = await databases.getDocument(
        process.env.APPWRITE_FUNCTION_DATABASE_ID, 
        collectionId,
        documentId
        );
        //checking if status was updated
        if(documentDetails.status=="txn commited")
            await triggerNotary1Function(databaseId,collectionId,documentId,log)
            // await triggerNotary1Function(databaseId,collectionId,documentId,log)
            // await triggerNotary1Function(databaseId,collectionId,documentId,log)


          return res.send('Documents updated successfully.');
  }catch (error1) {
     
      error('Error updating documents: ' + error1);
      return res.send('Error updating documents.');
  }
};



async function triggerNotary1Function(databaseId,collectionId,documentId,log) {
  try {
log("ins")
     const payload = {
      databaseId: databaseId,
      collectionId: collectionId,
      documentId: documentId
      };

       const encryptedData= encryptObject(
      payload,
      Buffer.from(process.env.KEY, "hex"))

      const cipherText = encryptedData.ciphertext.toString();

    const notaryClient = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NOTARY_PROJECTID)
    
    const databases = new Databases(notaryClient);

    const query = [
      Query.equal('entityId', ['2'])
     ];
  
  
    databases.listDocuments('65c9f1dab1c765f9541e','65c9f1e49ee8dcddbe37', [], 100, 0, query)
      .then(async response => {
          // Handle the response
          //log("res"+response);
          const documents = response.documents;
          
          // Extract the 'url' field from each document
          const urls = documents.map(doc => doc.url).toString();
         
          for (const url of urls) {
            log("URl:"+ url);
          await axios.post(url.toString(),cipherText);}
          // Process the URLs as needed
      })
      .catch(error1 => {
        
          log('Error:'+ error1);
      });
//const notaryurl1 = process.env.notary1_url; 
} catch (error1) {
      log('Error triggering webhook in the target project: ' + error1.message);
    }
  }




  const encryptObject = (obj, key) => {
    // Serialize the object to a string
    const serializedObj = JSON.stringify(obj);
 
    // Generate a random nonce
    const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
    sodium.randombytes_buf(nonce);
 
    // Encrypt the serialized object
    const ciphertext = Buffer.alloc(
      serializedObj.length + sodium.crypto_secretbox_MACBYTES
    );
    sodium.crypto_secretbox_easy(
      ciphertext,
      Buffer.from(serializedObj),
      Buffer.from(process.env.NONCEHASH, "hex"),
      key
    );
    return {
      ciphertext: ciphertext.toString("hex"),
      nonce: nonce.toString("hex"),
    };
  };




  
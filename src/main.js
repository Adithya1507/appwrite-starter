import { Client,Databases,Query } from 'node-appwrite';
import axios from 'axios';
import sodium from "sodium-native";
import dotenv from "dotenv";
dotenv.config();
export default async ({ req, res, log, error }) => {
  try {

    // the body contains details of the document created
      const collectionId = req.body.$collectionId;
      const documentId=req.body.$id;
      const databaseId=req.body.$databaseId;
     
      // Initialize Appwrite client
      const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
          
      const databases = new Databases(client);

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
     
      const payload = {
        databaseId: databaseId,
        collectionId: collectionId,
        documentId: documentId
    };
      // const dataToEncrypt ={
      //       "objToEncrypt" : payload
      //  }
      // const encryptUrl= process.env.encrypt_url;




     // const encryptedData=await axios.post(encryptUrl,dataToEncrypt);

    const encryptedData= encryptObject(
      payload,
      Buffer.from(process.env.KEY, "hex"))

      const cipherText = encryptedData.ciphertext;

      const notaryurl1 = process.env.notary1_url; 
      await axios.post(notaryurl1,cipherText);

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



  encryptObject: 
  ),
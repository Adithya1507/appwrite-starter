import { Client,Databases,Query,Account } from 'node-appwrite';
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
          .setKey('888ce794869b58939d31ad397223613f6813109d135b16ae12f116d14c6ce1f82db3acba8efde273b94474dce49be4598e4fa6a60459db02124992496c2e6555f54a2cd5aed84671ad9b9032e53e39f295f97d42d45871e2826afaffc3858357c4d68f14ba275d7783ad9dc67798c74ed6ad5b233421d47f10997c52a4d62843')
          
      const databases = new Databases(client);
      const account = new Account(client);
      //const response = await externalClient.account.get();
      const response = await account.get();
       log("response",response)
   // Get organization ID from the response
       const organizationId = response.result.organizations[0].$id;
   
   log('Organization ID:', organizationId);
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

      const cipherText = encryptedData.ciphertext.toString();

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




  
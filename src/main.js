import { Client,Databases,Query } from 'node-appwrite';
import axios from 'axios';
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
  }    catch (error1) {
     
      error('Error updating documents: ' + error1);
      return res.send('Error updating documents.');
  }
};
async function triggerNotary1Function(databaseId,collectionId,documentId,log) {
    try {
      const webhookUrl = 'https://65cca72dd29fc671edf8.appwrite.global/'; 
      const payload = {
        databaseId: databaseId,
        collectionId: collectionId,
        documentId: documentId
    };
      const dataToEncrypt ={
            "objToEncrypt" : payload
       }
       const encryptUrl1= process.env.encrypt-url
       log("encryptUrl1: "+encryptUrl1)
      const encryptUrl='https://65cca595704ed3c371af.appwrite.global/'
      log("encryptUrl"+encryptUrl)
      const encryptedData=await axios.post(encryptUrl,dataToEncrypt);
      log("encryptedData: " + JSON.stringify(encryptedData.data));
      const data = encryptedData.data;
      const cipherText = data.encryptObject.ciphertext;
      log("cipherText"+ cipherText)
      await axios.post(webhookUrl,cipherText);
      log('Webhook triggered in the target project.');
    } catch (error1) {
      console.log('Error triggering webhook in the target project: ' + error1.message);
    }
  }
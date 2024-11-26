import { SimpleDBConnect } from "@codeffekt/ce-node-express";

async function boostrap() {

    // SimpleDBConnect.initFromEnv();

    await SimpleDBConnect.connectAdminToAdminDB();
    await SimpleDBConnect.close();

}

boostrap();
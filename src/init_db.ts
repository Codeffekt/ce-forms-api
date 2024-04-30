import {
    CeService, CeFormsInitService, SimpleAdminDBApp,
    SimpleDBApp,
    DbConfigService
} from "@codeffekt/ce-node-express";

export async function init_database() {
    const admin = CeService.get(DbConfigService);
    const initService = CeService.get(CeFormsInitService);

    await SimpleAdminDBApp.init();
    await admin.initDatabase();
    await SimpleAdminDBApp.close();

    await SimpleDBApp.init();
    await initService.init({        
        defaultAccount: {
            login: process.env.CE_FORMS_LOGIN,
            account: process.env.CE_FORMS_ACCOUNT,
            passwd: process.env.CE_FORMS_PASSWD,
        },
        clearTables: false
    });
    await SimpleDBApp.close();
}

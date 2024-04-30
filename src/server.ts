import { AssetsApiServer, CeService, ExpressApplication, FormsApiServer } from "@codeffekt/ce-node-express";

async function bootstrap() {

    await CeService.get(ExpressApplication).checkAppInstallation();

    CeService.get(ExpressApplication).runAppFromEnv("CeForms API", {
        routers: [
            CeService.get(FormsApiServer),
            CeService.get(AssetsApiServer),
        ]
    });

}

bootstrap();


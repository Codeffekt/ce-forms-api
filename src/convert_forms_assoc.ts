import {
    FORM_BLOCK_TYPE_FORM_ASSOC,
    FORM_BLOCK_TYPE_INDEX, FormAssoc, 
    FormInstance, FormRoot, FormUtils
} from "@codeffekt/ce-core-data";
import {
    FormsService,
    Inject,
    SimpleDBApp
} from "@codeffekt/ce-node-express";

class FormsConverter {

    @Inject(FormsService)
    private formsService: FormsService;

    private constructor() {

    }

    static async convert() {
        const converter = new FormsConverter();
        await converter.convert_roots();
    }

    private async convert_roots() {
        const roots = await this.formsService.getFormRoots();
        for (const root of roots) {
            await this.convert_root(root);
        }
    }    

    private async convert_form_blocks_index(form: FormInstance) {

        const index_blocks = FormUtils.getBlocks(form)
            .filter(block => block.type === FORM_BLOCK_TYPE_INDEX && block.value != undefined);

        const formAssocs: FormAssoc[] = index_blocks.map(block => ({
            ref: FormUtils.createFormAssocRef(form.id, block.field),
            form: block.value
        }));

        await this.formsService.insertFormsAssoc(formAssocs);
    }

    private async convert_form_blocks_array(form: FormInstance) {

        const array_blocks = FormUtils.getBlocks(form)
            .filter(block => 
                block.type === "formArray" && 
                block.root != undefined &&
                block.index != undefined);

        for(const block of array_blocks) {
            console.log(`Clear index of block ${block.field}`);            
            const res = await this.formsService.getFormsQuery({
                limit: 0,
                queryFields: [{
                    onMeta: true,
                    field: "root",
                    value: block.root
                }, {
                    field: block.index,
                    value: form.id
                }]
            });
            const linkedForms = res.elts;
            const formAssocs: FormAssoc[] = linkedForms.map(linkedForm => ({
                ref: FormUtils.createFormAssocRef(form.id, block.field),
                form: linkedForm.id,
            }));
            await this.formsService.insertFormsAssoc(formAssocs);
            block.index = undefined;
        }        
    }

    private async convert_form_blocks_assoc(form: FormInstance) {

        const array_blocks = FormUtils.getBlocks(form)
            .filter(block => 
                block.type === FORM_BLOCK_TYPE_FORM_ASSOC && 
                block.root != undefined);

        for(const block of array_blocks) {
            console.log(`Change block ${block.field} to formArray`);
            block.type = "formArray";            
        }        
    }

    private async convert_root(root: FormRoot) {
        console.log(`Process root ${root.id}`);

        const res = await this.formsService.getFormsQuery({
            limit: 0,
            queryFields: [{
                onMeta: true,
                field: "root",
                value: root.id
            }]
        });

        const forms = res.elts;

        for (const form of forms) {
            await this.convert_form(form);
        }
    }

    private async convert_form(form: FormInstance) {
        console.log(`Process form ${form.id} from root ${form.root}`);        
        await this.convert_form_blocks_index(form);
        await this.convert_form_blocks_array(form);
        await this.convert_form_blocks_assoc(form);
        await this.formsService.updateForm(form, form.author);
    }
}

async function convert_database() {
    await SimpleDBApp.init();
    await FormsConverter.convert();
    await SimpleDBApp.close();
}

convert_database();

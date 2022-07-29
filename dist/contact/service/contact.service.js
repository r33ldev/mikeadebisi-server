"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const contact_model_1 = require("./../model/contact.model");
class ContactService {
    async newContact(input) {
        const contact = new contact_model_1.ContactModel({
            name: input.name,
            email: input.email,
            message: input.message,
        });
        await contact.save();
        return contact;
    }
    async getAllContacts() {
        return contact_model_1.ContactModel.find();
    }
    async getAllContactsByEmail(email) {
        return contact_model_1.ContactModel.find({ email });
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map
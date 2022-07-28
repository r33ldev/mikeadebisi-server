import { newContactInput, ContactModel } from './../model/contact.model';
export class ContactService {
    async newContact(input: newContactInput) {
        const contact = new ContactModel({
            name: input.name,
            email: input.email,
            message: input.message,
        });
        await contact.save();
        return contact;
    }
    async getAllContacts() {
        return ContactModel.find();
    }
    async getAllContactsByEmail(email: string) {
        return ContactModel.find({ email });
    }
}
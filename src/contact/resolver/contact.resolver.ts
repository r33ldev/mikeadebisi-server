import { Arg, Mutation, Query } from 'type-graphql';
import { Contact, newContactInput } from '../model/contact.model';
import { ContactService } from '../service/contact.service';

export class ContactResolver {
    constructor(private contactService: ContactService) { 
        this.contactService = new ContactService();
    }

    @Query(() => [Contact])
    async getAllContacts() {
        return this.contactService.getAllContacts();
    }

    @Query(() => Contact)
    async getContactsByEmail(@Arg('email') email: string) {
        return this.contactService.getAllContactsByEmail(email);
    }

    @Mutation(() => Contact)
    async newContact(@Arg('input') input: newContactInput) {
        let contact 
        try {
            contact = await this.contactService.newContact(input);
        }catch(e) {
            console.error(e);
            return {
              status: 'error',
              message: 'Error saving contact',
              data: null,
              error: e.message
            };
        }
        return contact
    }

}
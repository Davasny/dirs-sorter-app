import { type ErrorResponse, Resend } from "resend";
import { config } from "@/lib/config/config";
import { logger } from "@/lib/logger";

export class ResendClient {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(config.RESEND_API_KEY);
  }

  private async execute<T extends { error: ErrorResponse | null }>(
    fn: () => Promise<T>,
  ): Promise<T> {
    let response: T;

    let tryCount = 0;
    while (true) {
      response = await fn();
      if (response.error?.name === "rate_limit_exceeded") {
        logger.warn({
          msg: "Rate limit exceeded, retrying in 500ms",
          tryCount,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        tryCount++;
      } else {
        break;
      }

      if (tryCount >= 5) {
        break;
      }
    }

    return response;
  }

  public async getAudience() {
    // in free tier there is only one audience
    const existingAudiences = await this.execute(() =>
      this.resend.audiences.list(),
    );

    if (existingAudiences.error) {
      logger.error({
        msg: "Failed to list existing audiences",
        error: existingAudiences.error,
      });

      throw new Error("Failed to list existing audiences");
    }

    if (existingAudiences.data.data.length === 0) {
      logger.error({
        msg: "No existing audiences found",
      });
      throw new Error("No existing audiences found");
    }

    return existingAudiences.data.data[0].id;
  }

  public async manageSubscriber({
                                  email,
                                  action,
                                }: {
    email: string;
    action: "add" | "remove";
  }) {
    const childLogger = logger.child({email, action});

    childLogger.info({msg: "Adding subscriber to audience"});

    const audienceId = await this.getAudience();

    childLogger.setBindings({audienceId: audienceId});

    childLogger.info({msg: "Getting existing contacts"});

    const existingContacts = await this.execute(() =>
      this.resend.contacts.list({
        audienceId: audienceId,
      }),
    );

    if (existingContacts.error) {
      childLogger.error({
        msg: "Failed to list existing contacts",
        error: existingContacts.error,
      });

      throw new Error("Failed to list existing contacts");
    }

    const existingContact = existingContacts.data.data.find(
      (contact) => contact.email === email,
    );

    if (action === "add") {
      if (existingContact) {
        childLogger.info({msg: "Subscriber already exists"});
        return;
      }

      childLogger.info({msg: "Adding new subscriber"});

      const newContact = await this.execute(() =>
        this.resend.contacts.create({
          email: email,
          audienceId: audienceId,
        }),
      );

      if (newContact.error) {
        childLogger.error({
          msg: "Failed to add new subscriber",
          error: newContact.error,
        });

        throw new Error("Failed to add new subscriber");
      }

      childLogger.info({
        msg: "New contact created",
        newContactId: newContact.data.id,
      });

      return;
    }

    if (action === "remove") {
      if (!existingContact) {
        childLogger.info({msg: "Subscriber does not exist"});
        return;
      }

      childLogger.info({msg: "Removing subscriber"});

      const result = await this.execute(() =>
        this.resend.contacts.remove({
          id: existingContact.id,
          audienceId: audienceId,
        }),
      );

      if (result.error) {
        childLogger.error({
          msg: "Failed to remove subscriber",
          error: result.error,
        });

        throw new Error("Failed to remove subscriber");
      }

      childLogger.info({
        msg: "Subscriber removed successfully",
        contactId: existingContact.id,
      });
    }
  }

  public async sendEmail({
                           email,
                           title,
                           content,
                         }: {
    email: string;
    title: string;
    content: string;
  }) {
    const childLogger = logger.child({
      email,
      title,
    });

    childLogger.info({msg: "Ensure subscriber exists"});
    await this.manageSubscriber({email, action: "add"});

    childLogger.info({msg: "Sending email to resend api"});

    const result = await this.execute(() =>
      this.resend.emails.send({
        from: "Kuba from justdockerize.it <hello@mail.justdockerize.it>",
        to: [email],
        subject: title,
        html: content,
      }),
    );

    if (result.error) {
      childLogger.error({
        msg: "Failed to send email",
        error: result.error,
      });

      throw new Error("Failed to send email");
    }

    childLogger.info({
      msg: "Email sent successfully",
      emailId: result.data.id,
    });
  }
}

# Riot answers — product questions (received 2026-10-05)

Answers from Riot Games to the product questions prepared on 2026-10-02. Verbatim.

## Time Zone
**What time zone is the sale opening time based on? Is it shown to fans in their local time or in a fixed time zone?**
The event should have a single time zone for opening. We can set that in utc time and it should open for everyone globally at that time.

## Navigation & Event Browsing
**Will there always be three featured events, or could there be just one or two? With one, we assume it spans the full width. With two, how should the cards be laid out? Does "N on the calendar" count all published events or only those under "More events"?**
No there may be less as we get close to the end of the year. If there is just one event then yes span the whole width. If two then we can just have a single featured event and the other can go to more events. N on the calendar is all published remaining events.

**If there are no events beyond the featured ones, should "More events" be hidden, or should we show a message like "More events coming soon"?**
Show message "Check back later for more events".

**Why doesn't the design let fans know they have items in their cart?**
Good callout I will have design fix that.

**If a page fails to load (due to a connection issue, missing data, etc.), is there an error page or a 404?**
Yes we can design one.

## Event Page Structure
**When exactly does the sales period for an event close?**
It does not close until the event is over. Tickets can be sold for the main event until they're sold out. Side events and on demand events will have tickets sold throughout the weekend of the event.

**While the event is taking place, are passes and side events still on sale?**
Yes.

**When the event ends, does it disappear from the portal at that moment, along with its passes and side events? For example, if it ends at 8:00 p.m., does it disappear at that time?**
Yes it can disappear maybe 24 hours after the event ends.

**Should it disappear at the same moment across all time zones?**
Yes.

**If someone opens the link to an event that has already ended, what should they see?**
"This event has concluded".

## Cross-Cutting
**Are event dates and times shown in the fan's local time (based on where they're browsing from) or in the venue's time?**
Venue date/time.

**Do we need to implement WCAG 2.1? It isn't in the contract, but it's the European accessibility standard (European Accessibility Act).**
I have no idea what this is but if it's a requirement by law then yes.

## Localization & Multi-Currency
**Do we need Latin American Spanish for the Mexico City event?**
There is no Mexico City event. We should just localize in the languages that are in the contract.

**Can you provide the Checkout legal copy translated into all languages?**
We will provide all copy at a later time. Just use placeholder (Lorem ipsum) for now.

**Are the purchase confirmation and sale opening notification emails sent by your CRM, and do you handle their language?**
We have already answered this multiple times. We expect that confirmation emails are sent by globant. If you guys cannot then we can use our email service.

## Event Passes
**Can you confirm that only one pass can be purchased per account per event? In other words, a competitor can only buy one ticket, and the same goes for a spectator.**
This should be configurable by ticket type. By default we will usually allow 1 per ticket type but that may not always be true.

## Restricted Sales & Comp Tickets
**For restricted sales, should we use an access code or account-based visibility?**
We want both options.

**Which RSO profile variables can restrict purchases?**
It's just a flag on the account itself - so either the account can access or not.

**How are comp tickets issued, and who assigns them?**
Comp tickets should be assigned from the backend. Riot will have ticketing operators that handle this.

## Cart & Checkout
**Can you confirm the "Free cancellation up to 14 days out" policy? Can you provide the legal copy?**
Refunds should be configurable from the backend (allow, do not allow). We will provide copy at a later time, for now just use placeholder copy.

**Who is listed as the seller, and how are taxes handled in each country? In the EU, does the price shown to consumers need to include VAT?**
We can list Riot Games as the seller. Taxes and VAT should be configurable by event location like we discussed.

## Vouchers & Discounts
**Currently, only one discount can be applied per purchase, because SmartVenues handles discounts, not vouchers. Do you need to apply more than one to a single purchase?**
Yes, we will sometimes provide people with multiple vouchers.

**Could we set up a meeting to understand how your vouchers work and show you how the product handles them, like in Enrique's demo?**
Sure but we do need the ability to apply a voucher or discount code to the purchases.

**Your spec allows a voucher to be partially redeemed with the remaining balance kept, but the product doesn't support this today. Is it essential that we build it?**
It's not critical, no.

**The product doesn't currently support voucher expiration. Do we need to build it?**
You guys told us the exact opposite in our last meeting. We would want vouchers to expire since they are usually provided on a per event basis.

## My Tickets
**We don't generate a sales invoice, only a proof of purchase with no tax validity. What should "View Invoice" and "View Recap" display?**
How do you guys not generate an invoice for tickets that are purchased? How do you communicate to the user how much they just spent?

## Refunds
**Does the refund incident ticket also apply to side events?**
Not sure what you mean by refund incident ticket. Players should be able to refund side events, yes.

## User Management, Data, and Riot Account Linking
**User sync flow and timing: Can we confirm that the profile will be created and mapped in SGA/One Venue only during the user's first purchase via Riot Account Linking, ruling out any need for an initial bulk migration of Riot's user database?**
Profiles should be created on first purchase, when we comp a ticket, and when we provide access codes/entitlements to a players account. We do not need to mass add riot accounts, but it's important that all 3 of those function properly.

**Data protection contractual framework (GDPR): How will the roles for processing the sensitive personal data stored by One Venue be formalized in the contract and the security annexes?**
This is a legal question that should be addressed in the contract negotiation before signing.

## Sales and Post-Sale Product Features
**Discounts vs. Vouchers alignment: Does Riot accept One Venue's current Discounts model for the first phase, with the understanding that it won't support keeping a voucher's remaining balance after a purchase (partial redemption), or automatically reactivating the discount if a refund is processed?**
It is ok to not have partial voucher redemption. It is not ok to not give the voucher back after a refund. We cannot be taking player's money and not refunding properly.

**Rules for Upgrades / Product Changes: When changing product type (for example, upgrading from a standard to a premium ticket), do the business rules require keeping the same zone, or should zone changes also be allowed?**
What is a zone?

**Beneficiary Transfers (Transfer): Does Riot need tickets to be transferable between profiles within SGA (for example, for blacklist control or ID verification at venue entry)?**
Yes we should provide this option, but it is not required for mvp.

**Resending Digital Passes: Is there a specific post-sale use case that requires reissuing or resending digital passes or QR codes due to loss or updates?**
As long as the passes are accessible it should be fine.

## Layout capacity
**Right now, the capacity of a published event can be increased but not reduced. Does that work for you, or do you absolutely need to be able to reduce capacity while tickets are on sale?**
I think it's ok to limit only to increasing.

**Do you use gates at your events?**
No.

**How large are your events? So far, we've been discussing events with around 4,000–5,000 seats. Could you confirm the approximate maximum number of seats you're handling now or expect to handle in the future?**
4000-6000 but we may need to go above 6000 in some cases.

**Do you need more than one section or area? By default, SmartVenues creates one of each.**
We do not really care about sections or areas since it's one big event hall.

**Would it work for you if the map were created with just a name and the total number of seats?**
Yes we honestly don't really care about the map.

**Will customers be buying more than one seat per order?**
We do not have seats. This is the same question as number of tickets we allow people to purchase.

**Will you need to create zone groups?**
I don't know what a zone group is.

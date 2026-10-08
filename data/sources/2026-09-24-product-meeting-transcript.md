# Transcripción Completa de la Reunión

**Título de la reunión / archivo:** Product def 1_ Let's talk about ticketing portal - 2026_09_24 09_00 PDT - Recording.m4a

---

Here you go. Everyone else. key. Okay. Awesome. Hello Andrea.

How's it going?

Hey Andrew,

how you doing?

Good morning, please. Natalia.

Okay.

Okay.

Let's go.

Yeah, we can start. Uh I don't know if Garrett's going to join from our side.

Okay. Um, one second. Let me pull up the document really quick.

Sorry, one second.

No problem.

In the meantime joining. So the idea today Andrew is to to start with a you know broadcast throughout the complaint intended and the functionality as you achieve with us the Figma 5 in order to understand all the functionalities and second to we have some questions because yesterday we we was talking about this and so we we have some discussions so we would like to clarify some questions. And there maybe if we have a time I would like I would like to to to to talk about some comments related with with those some functionalities which is critical. Okay.

Yeah.

Really good. So do you want to share your screen in order to

walk us through the the functionalities?

Yeah.

Um so I'll kind of go through a few different flows here. Um, and uh, just feel free to stop me if you guys have any questions uh, at any point.

And again, these aren't final uh, but they are pretty close to being done. Um, so just keep that in mind.

Okay.

Um, so uh, and here actually let me just send you guys these prototypes as well. Uh I dropped this in our Slack channel too just so you have the the prototypes. It's it's the same Figma file but these are just like uh clickable prototypes.

Okay.

Um okay. So basically uh when you land on uh tickets.games.com uh you'll have um basically two tabs up at the top here. Find events which will be uh the main landing page and then my tickets which is exactly what it sounds like. It's the tickets that you own. Um, on the main page, uh, we have this bar right here for, um, all of the different games. I know we are just starting with Riftbound, though.

Uh, so really like the rest of these can be grayed out or something like that. Uh, or maybe we don't even have the other ones here for the beginning. We just, you know, ignore this whole bar.

But, um, go ahead, Oscar.

Uh, just initial question. Do we have to be logged in? in to access this or can be like anonymous buyer.

Yeah. Uh you have to be logged in to purchase but you do not have to be logged in to just browse the the page uh this page specifically. Um if you want to go to my tickets then yes you have to be logged in. So if you click my tickets it should redirect to uh the login page.

Okay.

Um so uh this is the design we have. We basically just have like a a few events that are highlighted that are happening uh very soon. Uh whether they are tickets that are on sale now uh or upcoming. Uh we're not going to have a ton of tickets on sale at the same time very often. Uh actually, it's actually very rare that we would have multiple tickets, like five different events on sale at the same time. So, this top one really will probably just be, you know, one big highlighted event. um we can come up with what the logic is for when a card shows up at the top here versus when it just shows here. Um so yeah, we can we can decide that detail later. Um but I'm fine with it just being one highlight card here.

Go.

Okay, Andre said I I have one question related with the with the highlighted events. For example, we with as we can see there are three main events. you know which is a regional qualifier regional qualifier Singapore, Los Angeles and Bolognia you know. So my question is um will be necessary to uh to implementing the image background for each one.

Yes.

Okay. Okay. Perfect. Okay.

Yeah. And and this one is green just because we we didn't want to put images behind every single one but uh they they really should look like this. And of course we will provide the images.

Okay.

Uh and because we only have you know 15 events per year,

we can hardcode this if you want. So we don't have to build if you guys don't have the current functionality to uh you know upload an image uh via a UI on the back end.

Uh if we need to just hard code uh you know this image for this event this image for this event that's totally fine.

Oh okay it's really good to know to know this because this is the reason because we have this this question because currently in our functionality we don't have the the you know the feature in order to provide the image or events you know so this is there is

either okay perfect y

yep that makes sense and and I feel like that's something that we can even hard code on the front end Okay. Um, cool.

Cool. Uh, what is important though is where they are and whether they are on sale uh or when they are coming on sale.

Okay.

Um, so once I click into an event, um, the header image here, uh, we can use the same one everywhere. I would prefer to use the same one that we're using here. Um, but if we need to use the same header image, you know, like we have here everywhere. That's also okay.

It's not a big deal.

Um, so once you click on the event, you basically land on the the page that shows you the event passes, the side events, uh, and on demand events. Uh, for the first version, we will not have ondemand events. So, you can just ignore this. Uh, the first, you know, first release is really focused on the event path. Um, the way that this page behaves, uh, is if you add a ticket, it adds it to your cart on the right hand side. If you want to see more about the event, you click more. Um, and then you can you can expand multiple of these at the same time. Go ahead.

Yeah. Okay. And I have another question related. For example, in the example, as we can see, which is a a standard competitor pass. We have a description and we have maybe some bullet points in the in the description. So currently we have a field in order to provide description for events but we have a limit of charge you know. So it's completely necessary to have maybe uh so increment so you know increase the the the characters in order to to to implement as you as you presented in this in this mockup you know for the Yeah. So the the data here is real data. Uh these are actual like actually what we provide for each of these different badges. And so uh you should expect that we will need

this much content per ticket.

Okay. In order to provide format for the you know because in this example we have I can see that there are maybe some checks or maybe bullet points. So what is the best way to to represent it. So it's it's important to have this part in order to provide maybe some y or maybe some type of format for that

text. Yeah. And it doesn't have to be check marks. It can be bullet points or arrows or whatever. Like it it doesn't need to be that fancy. But we definitely need the ability to separate these because if it if this was all just one description, it would I mean that's not very legible.

Yeah. What type of formats do you handle? any additional formats in the descriptions apart from these bullet points

or just with bullet points?

Just with bullet points should be fine.

Okay.

Yeah,

sounds good.

Thank you.

Y one good question about the tags and the classification of the badges. Is that a set number of of tags and categories like a competitor or visitor.

Yeah, it's pretty much uh standard and premium and competitor and uh admission. It's actually called attendee, but yeah, so there's basically four tags.

Okay.

Yeah.

Okay.

And the classification is just two like you are right there to spectate or to participate, right?

Correct. Uh you're either a competitor uh so like competitor here

or a spectator. Okay. Okay.

Uh so once you've added it to your cart, obviously you you can remove it from your cart. Um because you can only buy one ticket per person. Uh you'll notice that we don't have like a quantity or anything like that. And also after it's been added, it it just says selected. Um this is because we limit one per user uh typically on these tickets. Um so yeah so once you uh are ready to check out you click the checkout button. Um we just included these as examples here. Uh this page can you know Google Apple play. I know we are not including PayPal in the beginning credit card like you guys just need to let us know what options we can put here and then we can change the designs to uh to fit whatever payment methods you guys have.

I know we just have one pay method. I think it's a Stripe. Um, but I don't know if Stripe allows you to do Google or Apple Pay or if that's complete if that's considered a completely different payment method.

Uh, yeah, I believe that the in here maybe we need to list only Stripe and after you select Stripe as a payment method that will redirect you to the Stripe application and you may need to select there the the final payment method. I believe that That

exactly

is the way they are working.

Mhm.

Uh so you get redirected away from this page.

Uh there there are different approaches there. I believe that they support iframes, they support redirections. So so there is there are alternatives there. Yeah.

Okay. Yeah. I I do not love the idea of redirecting users away from the stage. So yeah.

Yeah. Yeah. Sure.

Cool. Perfect.

Um go ahead.

No. Uh just a quick question. Uh the other day when you show the preview of the web pages, uh we had discounts. Is that something that is not included here or maybe it's

Yeah, that will that will actually be in the side events. So, I'll show you guys that in the the side events flow over here.

Okay, Andrew, can you can you go back to another page to this? Exactly. So, I I had one question related with the event passes and site events, you know. So, it's possible to start selling without site events and on demand events created only to to start selling event passes.

Yes. Yeah. So that

that's that's actually the typical flow is we will put the event passes on sale first and then maybe like one month later

we will put the side events on sale. Sometimes we want we really do want to get to a world where both go on sale at the same time,

but it's like like right now it's like a a very big gap in time between those two things happening. So, uh so yeah, so you would basically uh and you'll see it when I move to the side events registration. Um but you know, we would put the event passes on sale and then separately we would put the uh side events on sale.

Okay. So I I I can imagine for example, so you you are going to to start selling only the event passes. So the the fan is going to to to to buy the the event passes and then he's going to to enter the port that the portal again in order to to to to have the site events on demand events, you know.

Yeah. Exactly.

Okay. Okay. Perfect.

Yeah. And and you shouldn't and again we'll get to to this when we get to the registration for the side events. You should not be able to purchase side events

unless you hold a standard or competitor badge.

Okay.

It needs it needs to be gated.

Mhm. Okay. Here.

It doesn't have to be gated, but it's just like a much better user experience. We really don't want people purchasing side events unless they're actually going to the event.

Mhm.

Does that make sense?

Okay.

Yeah. Okay.

Okay.

Um so once you go through the checkout flow, uh we we just made this like very quick because again it just kind of depends on on ideally it just pops an iframe and it does it all in here. Uh but once you checked out it just gives you the confirmation. Um, at this point we should email the receipt or or just like an email that says, "Hey, you've purchased a ticket." Um, and uh uh you can click view my tickets and then it takes you to my tickets page. Um, and then you'll see the event here. Uh, and uh, again, we can we can scope this down as well too. So if we don't have add to wallet in the beginning, that's completely fine. Uh if we don't even have a QR code, that's also completely fine. Um, but this is really just meant to be like checkin stuff. Uh, so it makes it a lot easier to check in. But if that is uh not something we support, then we can just remove this and shift this over.

Okay. So I have another question related with the QR code. So is only QR code in order to to get access for all the events for example you know for the like events on demand events you are going to generate only one QR code for get access in order to the parts of the event. Yeah, this one was actually for the main event. So just one QR code for the main event. Um you check in for side events on a completely different platform. So we we don't really do check-ins or we will not do check-ins for side events on this platform.

Okay.

So this QR code is basically something that the person on site can scan for when they want to give you your physical badge. Uh all of these events have physical badges that you receive when you go to the onsite. Um and so we just need a way to to to basically check people in. Um so this is just making it easier for the user to come in and show the QR code and then um you know the person that's there can can scan it uh and then check the player in, give them their stuff because if you look back here, we give them a lot of stuff. like it comes with a lot of stuff

and so uh you know this is basically just us saying okay cool let's check you in we'll hand over your bag of stuff and then uh you're all checked in

okay so I can understand before your explanation that it's for the main events we are going to generate one token which is a QR code for this case then we are going to generate a a QR code for the site events and we are going to generate the QR code for the

we don't need QR code for side events.

Okay. For the side.

Yeah. It's it's just the these passes events passes and it's really just to get your first it's it's basically to access the menu.

Okay.

Yeah.

Okay. Okay.

So inside the event you you manage uh the access to the side events using the same the credential that you are given when you enter

actually. So side events are going to when you register on the back end we're going to register you for an event on uh play riffbound.com which is our the website that we use for engaging with riffbound.

So you would just see the side events here and then you check it here. So you like it's it's completely separate.

Okay.

Yeah.

So basically what will happen is when um when you purchase an event

on the back end we will grab what's called your puid

and that is your um your internal identifier for riot and then we'll use that to register you for the event on the actual Riftbound site. So, it will automatically show up here and and we will handle that of course

like we'll build that with you guys.

Nice. Okay.

Uh that's it for the flow for the buying a main event pass. Any other questions there?

I have go. Sorry. Sorry. Go you. Okay. Uh, no, just uh I know we're going to the side events, but uh since the side events are gated, would it be possible to buy like the main event and the side event at the same time or uh we are bound to like purchase one first and then the other one?

Um, if both go on sale at the same time, then yes, you can purchase them at the same time, but typically they do not go on sale at the same time.

Okay.

Yeah. So

and I have

okay thank you I have a question. So you mentioned that we need to integrate I believe with a reef bound application or to manage these site events right that that are related or associated to the main event. So this is something that you already have that that you or or that you need to build in parallel with us to integrate with it.

We will build that in parallel.

Okay. Nice. Yeah.

Yeah.

Excellent. Okay. Thank you.

Basically, what we'll what we'll probably do is we'll build a service that listens to purchases

and anytime a purchase is made.

Yep.

Um we will uh grab the user identifier from the Riot login and then we will use that to register the player for the event.

Excellent.

Yeah.

Okay. So, I have a question related with the multi-day event. So, it's uh does have events that run across you know multiple days.

Yes, every single of every single event runs on across multiple days.

Okay. Okay. So h so what are the specific you know what what is this is the specific rules for you know for tickets we show across those days for example single access for all days specific passes you know,

uh they're they're basically just attendee badges for the whole weekend. We don't really do day one day passes or three-day passes. Like, you're just buying a ticket to the event and it gives you access for the full weekend. And also, like, you don't really even need to you guys don't even need to care that it's a multi-day event because the second they check in with the QR code, they probably won't come back to this website because they have their badge already. And then they just go into the event for the next three days with that badge.

Okay. Okay.

Yeah.

Okay.

So, this is really just like metadata for to show the user, but like there isn't anything special we have to do on day two or day three on the ticket platform because once they check in, they again they get their physical badge that they just wear around their neck and then that gives them access to the event hall and they probably won't come back here again for the main event pass at all.

But they have the possibility to arrive late, right? To like just attend the last day and the last day they will get their

Yes. Yes. Yes. That that is true. Yes. Yes.

So, we shouldn't treat an event as in the past until beyond the last day of the event. Maybe last day plus one.

Okay.

Okay. Okay. So, in terms of anonymous sales, Andrew, so we have to allow

Don't do it on a sales period. You cannot buy tickets without being logged in. Always.

Yeah. Always.

Okay. So that is anonymous set is not is not at all you know.

Yeah. Yeah. Exactly.

Perfect.

Cool. Secure code and digital passes and remember this is okay. Okay. For me for this part is pretty clear.

Cool. Yeah. And as you guys are going through this if you're like hey and I'm just making this up.

It's a pain in the ass to put the number of days into the event, we can just remove it. Like we can we we made designs here of what we want but if you're like hey we need to change this part otherwise it will add two weeks to the scope like please just let us know.

Uh you know the most important part is someone can buy a ticket uh you know and and go to the event. Everything else is kind of like fancy stuff around it. So

it's super cool to to hear this because this is the idea to today is is to understand all the future in general. to describe so the the main features and the functionalities in general. So then in the next meeting maybe we are going to you know to to discuss about solution that some proposal in order to to complete this part and to match with your solution that that is super cool here this

awesome all right

well one more question about uh when you launch the sale is it launch on a specific like time on a specific date does it depend on the time zone of the country No. So, we'll we'll usually just have it uh it opens globally at the same time or globally like in the countries that we support.

Um so, we just have like a a start date and it it it's open for everyone at the same time.

Okay.

Yeah.

Skype. Uh

no, that was a mistake. Sorry.

Okay,

cool. Um So now we're talking about side events. Uh so kind of similar flow. Uh same page. You'll see here this looks like a Christmas tree. Uh um uh if you are already if you already hold the pass for the event and you come back to this page, uh you'll see registered or or purchased or you know whatever. Uh and then we'll show here you already hold a pass for this event and then the type of uh ticket you you hold. already. And then once the side events are live, you'll you'll be able to click on the side events. Um this this works basically the same exact way. Uh you'll see the side events. The only difference is that these are organized by day. You'll see here uh and time. It's just like basically sorted by by date and time. Um if you want to add a side event, it works the same way. You know, you add I think this just added two uh Um, the see more does exactly the same thing. I don't think we have the the mock in here, but you click it and it just drops down and it gives you a description and shows some shows some data. Um, same checkout flow and then it'll show you your your little, you know, the the side events that you've purchased. And then, uh, when you purchase the side events, uh, this is the event, you know, regional qualifier Singapore. And then we would love the side events to actually show up within here. So the first thing here is your your your main event badge, standard competitor, premium, you know, admission, etc. And then a list of the side events that you've registered for. Uh, and the reason for this is we would like users to be able to just see everything in, you know, one slide. Um, but really what they'll be looking at is is here to be honest, actually. Um, Uh so that's that's basically the side event flow. So pretty much exactly the same thing. It's just side events instead of main events.

One question, if you have uh uh you you can go to the first page like where you show the ticket you already had for the site events just to have a question to the image.

Oh, I'm sorry. I thought I was sharing the my bad.

Oh, yeah. Yeah, there uh you're here. You already have like your premium competitor pass. When you go side events, it's all of the side events here are just for that one, right? Yeah, just for that pass.

Just for this event. Uh yeah. So the the side events are all the same for the event. They're not different per pass.

So if you have a standard Yeah. Okay. Yeah. So if you have a standard competitive a premium competitor, standard admission, or premium admission. All of the side events are the same for all of those passes.

Okay.

Okay.

But

I'm not sure if I

spectator can join an event. So there is no specific side event for a competitor

that spectator.

Okay.

Yeah. Uh basically all side events can be registered by all players. There's a main event that uh so if you're a competitor you will compete in a main event but again that's more like here so you would see like main event sing you know Los Angeles or you know qualifier Singapore uh and then you would see your side events too uh but on here you know it's it's basically just side events

okay uh the last thing here is just viewing the purchase tickets uh which I think we've gone through this honestly already um the flow that I didn't include here. Uh one sec, let me go back to the designs is the uh the vouchers it I'm not sure if our designer finished that work yet? Yeah. Okay. So, the the designs are not in here yet, but you'll see here

Mhm.

that um

this is the file which I have currently. I don't know if maybe are there two two2 files, two Figma files.

No. Yeah, it's it's the same file. I just don't think the designer put it in here yet.

Okay.

Uh Okay. Yeah. So, So basically that and I can just talk through the side events. Um so when you purchase a main event pass here you'll see here uh we provide side event vouchers

and this is basically just a discount on a side event.

Um and so when you purchase the premium badge we will give you a voucher for the side events and then when you're checking out for side events we would want to be able to apply that voucher.

Um And again, if we uh we can talk about the best way to do this. If it's just a discount code basically that you can use, um then it would just take the amount off of the the current value. That's actually how it works with Eventbrite today, which is what we use. Uh we give you a voucher. It's basically just $25 off for each voucher we give you. And then um you can apply it at checkout here. Um but it would really be here. So I I think we can we can work together on on where the best place is to put the vouchers from your guys's perspective or the discount codes if that should be in checkout, it should be in the cart, you know, wherever is easiest. But we we definitely need the ability to to have discount codes and vouchers.

Okay. Uh one question, do I guess is this way, but do we have to validate for these vouchers that they have purchased a premium uh like a premium pass or do we have like kind of vouchers that you can apply because you they gave you a code and that works for any any uh ticket you have?

Uh the latter one. Yeah. So you don't have to be holding like a premium competitor because we may issue vouchers for other reasons. Um so as if you have a voucher, you can use the voucher.

The only thing is that you should not be able to use vouchers on main uh event passes, you should only be able to use them on side events.

Okay?

And and one way that we can do that is um uh you receive the voucher when you purchase the pass and you can use it on the side events, but once that event is over, we can maybe expire the vouchers or I don't know, we can maybe get a little bit uh we can think about the best implementation of the vouchers together. How do you guys handle like discounts or vouchers or you know discount codes? or whatever. Today

we have two ways.

I don't know. So there are two different ways. Currently we have the the general discounts and the conditional discounts. The general discounts are being used as as you mentioned a little bit Andrew that is basically using a discount code. So you apply a discount code that will provide you some discount on your on your purchase and This is the general and the condition conditional one is when you buy for example the main event the ticket you we create for your profile a discount that is that you can use only when you have that ticket. So when you and you associate to a new product it's kind of a little bit complex to explain right now but you basically when you have a um a product bought for your profile, you can access a discount for a new product. So I I'm think that maybe this is this is the the scenario that you are um telling us here. So basically when you have the access to the product of the main event when you have the entitlement we call it the entitlement when you have the entitlement to access the main event you gain the discount to acquire a new product that in this case could be the the side event. So basically and that discount is configurable too. So maybe that that's the way to go here. But but we need to analy that makes sense. Uh sorry, one quick question.

Can you control what you can use that discount code for?

Yes.

Okay.

Yes,

that sounds like the approach we would probably use then.

Sure. You're referring that control. You're referring to which are the products that the buyer can buy using discount. Yeah. Yeah. Yeah. We have it. Yeah.

Yeah.

Yeah. Because I have one question, Andrew. So, can can you explain how do you do you expect to to to apply the discounts in in the tickets or in the in the in the purchase for example?

Yeah. It's kind of just exactly like Daniel uh just said um when you when you purchase the main event pass, we will get we will entitle you with say €25

and then you can use that €2 on side events. for the same event.

Okay?

So, you shouldn't be able to use uh say you you get a $25 voucher voucher from uh RQ Singapore, you shouldn't be able to use it for RQLA.

Okay.

As long as we can control the the target products that you can use it on, then yeah, that that works perfect. And then we can

Yeah, it it doesn't really matter to me where you apply it. If you apply it here

or you apply it here, it it's the same s*** at the end of the day.

Okay.

Yeah. This was my my next question. So what is what is the best way in order to because I can see the discounts applied in your design. So this this is my question. So do when do you expect to to have but as you mentioned before so for you it's not really important to have in in in the in the uh in this page for example in the check out page or in the in the order page.

Yeah. It doesn't really matter too much. Yeah. As long as you can apply it before you check out.

Mhm. That's that's really the most important thing.

Okay.

Can you add multiple vouchers? Maybe one you get by buying the premium and the other one because you gave them the voucher.

Yes, you should be able to. Yeah. And and we can treat that as like one voucher. Uh well, I guess maybe that's a question for you guys. Say I we give $50 voucher, but my side events only cost $25. Can I apply the voucher to the value there and I still have $25.

Not really sure.

That's a very good point. I don't think that we are allowing uh partial the use of part

partial amounts in the discounts.

Can we give multiple discounts?

Multiple discounts.

I believe that what we can give is the possibility to use the same discount more than one time.

I believe that's kind of the same thing in practice

kind of. Yeah, I believe

we can figure this out. Honestly, this this is like, you know, uh

let's just see. This is I think one of those things that let's just see what the the tech allows us to do and we can build the user experience around what the tech allows us to do.

Yeah. Maybe we give people less options.

Yeah. Uh the other thing that I forgot to mention here is like add-ons. So, um and I'm so sorry that we don't have the designs completely finished yet. Uh we'll make sure that they are completely done by by next week, but um so an add-on, say we want to give people the ability to purchase um a booster box of Riftbound cards. Um you know where uh well one I guess first question is do you guys support add-ons merch add-ons you know extra add-ons whatever

no for now because uh no

no cut only

so we would basically just have to bundle whatever we are giving players into the the uh what's it called the pass

the product That's no problem. That's basically what we do today.

Mhm.

Okay.

It's nice to have for you or it's nice to have

uh it will be a problem at some point. Uh probably not in the beginning, but uh yeah, some it becomes a problem for some of our other games

um where we want to sell. We do a lot of upselling of of like uh you know, basically it's basically upselling you know like merch and stuff like that. Um, we don't do it so much for Riftbound. Uh, so it won't really be a huge problem for Riftbound, but it will become kind of a pain in the ass, uh, down the line when we want to scale this to multiple games.

Okay.

Okay.

Yeah, we are working in different initiatives currently. So, we are extending the platform. So, I I hope that in the future that will gain.

Cool. Yeah. I would be super curious also to know like what is on your guys' road map because um you know maybe uh we don't know uh maybe something that exists in the platform today that we're not using um

you know we we want to be able to uh offer more things over time.

Okay. Okay.

Cool. Um that's basically it. Let me see if I missing anything. So, uh, so no add-ons. Uh, we will design. Well, where would you guys prefer that the vouchers are? Just so we can do the designs here or here

the discounts.

Yeah, I believe that the best

before the check out.

Yeah, exactly.

Mhm.

The check out there

in the in the next in the checkout page instead of in the cart because Yeah. In that one. Exactly. Thank you. Yeah. No problem.

So, uh yeah, because what we are doing right now is filling up the cart basically with a product that you would like to to buy and after that when you place the order, yes, the order is placed with including the discounts. But before that, we were not managing uh discounts for now.

Okay. And the voucher you can choose to apply it, right? It doesn't get added automatically.

Yeah, exactly. So, could you go to the payment the payment order in order to go the payment order page?

Uh, this one.

This one. Exactly. Yeah. Or the confirmment. So, and Daniel, so our our order confirmment currently is a bit different with that. So, there are any conservated with this design of this proposal that you consider because for example in box office is completely different. But I think that's Not from my side. I don't know if you see something, Oscar.

No, just No, no, no.

Okay, cool.

I I did have a question on the main on the main event. You had a a tab on on the top left top right side on top. I This is side events, right? Yeah. No, this is No, there's one that says you have three something I I missed it.

Oh, yeah. That was the vouchers, but we can remove that right here.

Yeah. Yeah. I didn't know what what was that. We can remove that.

Yeah. Yesterday we was discussing about this.

Yeah. Yeah. We we can remove that. No worries.

Okay.

Um Okay. So, there's there's a few more things I just wanted to talk about from like a feature perspective.

Um so, Uh we do a lot of like audience limited sales where certain certain users when they're logged in can access the tickets and others cannot.

Uh that is all gated by your your your Riot account.

Um

what functionality do you guys have for access codes uh or you know uh fan limited sales? Uh I think when when we first met with it and we got the the download of the platform, we saw access code specifically, but if you guys can walk me through kind of like what exists for for that seeing an uh element for lawyer players via registration access code. Okay, I don't know. Maybe that that was that was included in the in the build of the ticketing portal.

Um

I'm not sure I was not including those conversations or

Yeah. Yeah, it's okay. We we got like a uh a while back we got a um a demo of the I think it is it one venue the the back office product

and uh one of the questions we had was like hey can we can we do like access code sales

um and I think it was Max I I I forget exactly who was running us through the platform but they said that there is the functionality because this is a pretty critical one for us for sure.

Okay.

Okay.

Okay.

Let me confirm this part with with with Enrique in order to understand. So what is the the

functionality for for us code? he can he can show it in the in another meeting.

Okay.

Yeah. And we can if that's something that does not exist uh we can build it with you guys.

Basically the the experience would be kind of like um when you try to when you try to add something to your cart

if you don't have the access like you know you click uh let's just say you click uh add

it would pop up a little modal asking you for an access code. code and then the access code that you you would input the access code and then it would add it to your cart. So, it would kind of be like a check to make sure that you're eligible to purchase before it actually adds it to your cart.

Okay.

Yeah.

I see.

Um and and that isn't necessarily something that we Well, I guess we would need to be able to configure the events to use access codes, but

yeah.

Okay.

One question that uh Uh is is that said that we need the access code for that or it would be better just asking uh it would be better if a logged user that has those rights because I think that's something you would give us right in when when the user is logged in has access to that product and that product should should be seen. I'm I'm asking

that's actually yeah

user experience right because it's like you are seeing an event that you cannot buy if you don't have an if you don't have code. So, it's I don't know.

I'm I'm also okay if if you guys have the ability to do that on the back end with like entitlements, then that is also okay. We can on the back end we can entitle users um

to to be able to even see the ticket option here.

Okay. So, if you can see something, you can buy it, right?

Yeah. Yeah, that's that's okay.

Okay. No, just just to see it both ways to see what which approaches we can take. Yeah, I either one is okay. Um,

yeah, I think that's one of those things that let's just figure out what we can do with the platform

and uh and then we can figure out the best way to build the UX around that.

Uh, the other one is complimentary tickets. Uh, and this is just all on the back end. Um, being able to say here like we're giving you this ticket for free. Uh, when we give you the ticket for free, it would just show up as if you purchased it. Uh but the invoice would just say free or something like that.

Does that exist?

This is

these these are all things that we uh talked about early on. So the answer is no for all these things be a little concerning.

Yeah, this is maybe invitation ticket Danny maybe.

Yeah, could be an invitation. take it

how you are handling that. Sorry, could you go again Andrew?

Yeah. So um we so the example here is like uh for content creators sometimes we will give them free tickets. Uh so we will basically just say okay instead of this person person purchasing a ticket we just want to give it to them for free.

Whether that's you know a a $500 voucher uh or an invitation I don't know. It doesn't really matter to me. The most important thing is we on the back end, like in your guys' one venue, just want to be able to say, "Give these people free tickets." How we do it, I don't really care as long as they don't have to pay for it.

Okay.

Yeah.

Yeah. We have different possibilities uh to that. I believe that the invitations

we can or I see right now I see two different ways. Or we use an internal user that is using this ticketing portal to buy um an invitation with some code, let's say some discount code that could be a limit of 20 uses. So he's the internal user can buy those 20 tickets and just that will be invitations and just distribute them amongst the the people that that should go to the event. Or the other way that we are we are doing the invitations right now is outside SGA. We have another application that we that is called box office. We we are creating those invitations uh there in box office de so I don't know if that is viable or not but at least we have two different ways to to do that I see at least two different ways

yeah so I have more question related with this so Andrea does necessary to create an order payment which is a zero dollar payment for for a free tickets in in this case or

yeah that's okay so so just to confirm So, basically, you would go through

um you'd go here, you'd click on it, uh you know, you'd say add, and it would just be zero dollars.

Mhm.

Okay.

That's fine.

Yeah. As long as it's for like specific person, you know, specific accounts, right?

Yes.

Okay.

How do you guys handle accounts on your end? Like because all everything is going to be tied to your right account. So, like what would what would input on your guys's end to say that this Riot account should get a free ticket. Is it their email? Is it

So we have currently for the discounts specifically for the discounts and and this type of um limit sales that we have some configuration about that are related to the entitlements that you already have basically. So you have an entitlement and that entitlement allows you to buy an other product, let's say.

So, we have some conditionals there, but it's using the entitlements that you currently have.

Um, and that is associated with a profile that is basically kind of your user, right?

So, it's that way that we use the discounts and that we facilitate that kind of of operations.

Got it. Okay, that works. this part for you. Okay.

It's hard to tell without seeing it to be honest. Um

it sounds like it should work, but I don't know. It's It's kind of hard to decide that without actually seeing how it works.

Yeah, it it might be worth sometime next week actually doing the demo the other way.

Uh where you guys give me a demo of the back office platform uh and we can ask questions and and go through these items again and just see like okay how exactly would we configure you know comp tickets and stuff like that

okay

cool um I guess this this isn't really like feature but more like how how good are you guys at handling load so um sorry do you want to go

no no no

okay okay no what we are doing now is scaling. Mo most of the infrastructure can be scaling and is automatically scaling. Currently the plan is to implement um a queue that is so we have we received different proposals basically implementing cues outside one plat the one venue platform that is basically in the ticketing portal we can implement the queue in the ticketing portal. However in aritecture we are reviewing currently an an additional approach that is basically implementing the queue inside the one one venue platform. So basically we need to go through it but there are different approaches that that we are reviewing still and each one has its own pros and cons.

Uh basically the good thing about implementing it in one venue is that you can use the same queue for different uh ticketing portals. So basically if you have multiple ticketing platforms or portals, you could use the same queue that that's that's what we are analyzing currently.

Got it. Okay.

It's a work in progress, but yeah.

Yeah. I I'm just bringing this up because we will crash your site.

Yeah. Okay.

I I I assume we've crashed every single ticketing platform we've ever used.

Okay.

Uh so I I will be I hope we don't. Um but uh pretty much every single ticketing platform we've used, we've we've crashed. So, okay. Um Yeah, there are some tickets that we sell where a 100,000 people try to buy the ticket at the same time.

Yeah. So, that that needs to be Yeah, that needs to be stopped in the ticketing portal. So, we maintain the the one venue platform stable for for you to to use while we stop that type of uh with some limits in in the in the users that could access or that could buy the products with limit that in in the portal that would be efficient. Okay,

cool. Uh check out and payment makes sense. Um yeah, just confirming everything will be tied back to your RSO account. Uh RSO's riot sign on. You'll just hear us call it Riot Signon. Uh side events storage. This is a no. Oh, refunds. Um how do you guys handle refunds? Yeah.

Oh yeah. Yeah. Well, we have refunds for we have two different ways of handling refunds. You have the complete refound operation that you refound the complete order.

Mhm.

I mean as we are already implementing this for other clients, those other clients could be those others could have a mix. I don't see that. here because you can mostly have buy one ticket plus the side events or maybe two tickets in parallel maybe at most I see for what you're telling us but we have two different ways you can do the the refund for the complete order in the case that you ref um have multiple items or you can have to refund or you we are currently uh finishing one feature that is partial refunds that you can refund

by item in the order. You don't have to refund the complete order, but you can have just I want to refund just the side event item that you bought in this order. So,

perfect. Okay. That that will be a requirement because people will refund side events all the time.

Like very frequently.

Okay. So, but for this part in order to to to have alignment so it's possible only because currently as as Danny explained before. So we have only the the the functionality in order to to make a a fully refund per perish.

We couldn't we couldn't launch with that. It has to be the item based refund for sure.

Okay. But in the future you are going to need for example partial refunds because it's

sorry I'm saying we cannot launch without partial refunds.

Mhm. Okay. Okay.

We need to review the road map because that that is already been implemented.

Exactly.

We need to view the the deployment to production the release to production of the partial refunds and see if that matches the dates.

Yeah, this is the reason because I I put this point here because to my my understanding right this is right now this but we we can to to do launch with the you know fully refund in in this part but in the in the future but we are going to have this feature in order to complete on the cover partial refund for you.

Perfect. Yeah.

And just to confirm Um users can refund themselves or do we have to refund for users?

Refund we are offering from from the one venue platform. We are offering the endpoints to be consumed and to refund. So

okay. So we can build the front end to refund a specific ticket.

Yeah. Exactly. That that is already ready.

Perfect. Yeah. So so we the the use case is basically You should be able to on your own as a user refund a specific item. That is like exactly what we need.

Okay.

Okay.

Perfect. And then just to uh going back to this platform uh when you refund

uh we will unregister you from the event. And so we just need to be able to listen to the the refund calls and pass that call over to Play Riftbound. And again, we will do this work with you guys. We don't expect you guys to integrate anything to to play riffbound. We will do all of that work. Uh but when you riffund the side event, you get unregistered from the side event over here. So,

you know, this website and the ticket websites are kind of like uh in sync with each other, if that makes sense.

Yep.

Okay.

Uh refunds. Cool. And then QR code checkin. Does that exist or how does checkin work today? physical.

This is just the QR code for for checking in. Oh, sorry, Oscar. I didn't see your hand up.

I know. I was going to ask about if the refund should be integrated with the same uh in the same flow that we No, in this page or in the other one in the one where we're doing

uh it will probably be somewhere in the my tickets here. Like we can think about where to refund. Uh well, I guess where would be best for you guys. Mhm.

Oh, that's something we need to analyze. Just want to know if it was going to be in the ticketing system.

Yeah.

Yeah, it it would Let's Let's put it in the ticketing system for sure. Um, let me actually add um yeah, I I will uh I'll I'm going to have my designers actually also think about the refund process. I think the best thing is that you can see the events in your my tickets and you can refund from here. The weird thing though is that if we do this like how would you refund a specific ticket? Um and so if if we cannot do this and refund specific tickets then what we can do is we can change the design so that each of these side events is just like a separate row you know like a a separate box and you can just click like ref, you know, imagine it said refund uh or or maybe there's like a three dot menu where you can refund so you don't accidentally refund. But um yeah, we can figure out that design.

Okay.

Okay.

Just off the cuff here, would you pre prefer that we separate these as different boxes for every side event? Is that easier for you guys more control?

Yes, I believe so.

Okay.

Yeah,

because from our side there will be different entitlements. I believe Diego. So if we can Yeah. split out. No problem.

Yeah, but I I I understand that they need a incident ticket for for the regular tickets. So the ticket is

Yeah, I don't know if it may be complex, Danny. So maybe not because we have currently we have this part in the product to create incident tickets

uh to create incident tickets. Sorry for for the side events

for the no the main events

for the main event.

The main event.

Yeah, sure.

Yeah, you can do it. Yeah, I don't see limitation there.

Um, so yes. So, would you prefer we separate these into different like individual boxes and then you can refund specific tickets?

I'm just trying to think about like if they're all included here, how do I actually refund? I would probably have to click explore event, go back to here, uh, you know, see, uh, yeah, see registered, click this, refund from there. That's kind of a pain in the ass.

Uh, I think it's probably better if we just had,

you know, a refund box and it refunds this whole thing is one item. They're all, maybe you have 10 items for the same, you know, uh, RQ Barcelona,

but at least each one is you can refund each one. All right.

Yeah.

Okay, cool. Let's do that. That's probably I think that's probably easier, better user experience, too.

So maybe this part is maybe a bit complex. I don't know, Danny, because we have Coron. So the incident ticket from another part is different for this one.

What are incident tickets?

Yeah, because they expect to have a bud in order to to make a refund from this ticket. You know,

as I understand you, Andrea, do you want to have a buden? in in this in this ticket in order to make a refund, you know.

Yes. Yeah, definitely.

Okay.

Let me think about this because we need to to do this cuz

Yeah, let's let's Yeah, certainly.

I think that we are late for the other meeting.

Oh, yeah. Yeah. Sorry. I didn't realize how over we were.

No, that was very interesting.

Sorry. Um yeah, we can continue on Monday and uh I'll have my designer make updates here.

Um and we can we can meet again next Nice.

Okay. Okay. Perfect.

Okay. I don't know if it maybe Andrea is possible to to share with us this document as you shared before in order to with the

uh Yeah. Yeah. with the the table.

Okay. Perfect.

Yes. Yeah. Yeah. Definitely. I'll send it to you.

Okay.

Thank you.

Thanks, guys. Have a nice day.

Thank you, Andrew. You too. Bye. Bye. Bye. Bye. Bye. Bye.

Thank you. Bye. Bye.

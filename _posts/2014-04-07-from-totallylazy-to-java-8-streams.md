---
layout: post
title: "From totallylazy to Java 8 Streams"
tagline: "Going with the stream"
description: "Moving from Java 7 and totallylazy to native Java 8 Streams API."
tags: [java8]
image:
  feature: texture-feature-04.jpg
  credit: Texture Lovers
  creditlink: http://texturelovers.com
---

Some time last year I had to go back to Java from Scala in my
work. About the first thing I did was to look up some nice library to funk
up the lack of functionality of Java 7 and what I found was *totallylazy*. What
I liked most about it was the
[concise documentation](https://code.google.com/p/totallylazy/#Examples)
that fits half a screen. We used totallylazy sequences extensively in our project.

<br>Now it is of course another year and the era of Java 8 with lambdas
and streams in the land of the dinosaurs has begun. A colleague of mine
moaned that the streams api lacks similar minimalistic documentation. So
true. So here is an attempt to fix that:

{% highlight java %}
Stream.of(1, 2, 3, 4).filter(even); // returns 2, 4
Stream.of(1, 2).map(String::valueOf); // returns "1", "2"
asList(1, 2).parallelStream().map(String::valueOf); // execute in parallel
Stream.of(1, 2, 3).limit(2); // returns 1, 2
Stream.of(1, 2, 3).skip(2); // returns 3
Stream.of(1, 2, 3).skip(1); // returns 2, 3
Stream.of(1, 2, 3).findFirst(); // returns 1
Stream.of(1, 2, 3).reduce(sum); // returns 6
Stream.of(1, 3, 5).filter(even).findFirst(); // returns Option.none()
Stream.of(1, 2, 3).anyMatch(n -> n == 2); // returns true
Stream.of(1, 2, 3).anyMatch(even); // returns true
Stream.of(1, 2, 3).allMatch(odd); // returns false
Stream.of(1, 2, 3).reduce(0, sum); // returns 6
Stream.of(1, 2, 3).map(String::valueOf).collect(joining(",")); // returns "1,2,3"
Stream.of(1, 2, 3).map(String::valueOf).collect(joining(":")); // returns "1:2:3"
{% endhighlight %}

Here is how streams api looks like compared to totallylazy:

{% highlight java %}
sequence(1, 2, 3, 4).filter(even); // both return 2, 4
Stream.of(1, 2, 3, 4).filter(even);

sequence(1, 2).map(String::valueOf); // both return "1", "2"
Stream.of(1, 2).map(String::valueOf);

sequence(1, 2).mapConcurrently(String::valueOf); // execute in parallel
asList(1, 2).parallelStream().map(String::valueOf);

sequence(1, 2, 3).take(2); // both return 1, 2
Stream.of(1, 2, 3).limit(2);

sequence(1, 2, 3).drop(2); // both return 3
Stream.of(1, 2, 3).skip(2);

sequence(1, 2, 3).tail(); // both return 2, 3
Stream.of(1, 2, 3).skip(1);

sequence(1, 2, 3).head(); // both return 1
Stream.of(1, 2, 3).findFirst();

sequence(1, 2, 3).reduce(sum); // both return 6
Stream.of(1, 2, 3).reduce(sum);

sequence(1, 3, 5).find(even); // return Option.none()
Stream.of(1, 3, 5).filter(even).findFirst(); // return Optional.empty()

sequence(1, 2, 3).contains(2); // both return true
Stream.of(1, 2, 3).anyMatch(n -> n == 2);

sequence(1, 2, 3).exists(even); // both return true
Stream.of(1, 2, 3).anyMatch(even);

sequence(1, 2, 3).forAll(odd); // both return false
Stream.of(1, 2, 3).allMatch(odd);

sequence(1, 2, 3).foldLeft(0,  sum); // both return 6
Stream.of(1, 2, 3).reduce(0, sum);

sequence(1, 2, 3).toString(); // both return "1,2,3"
Stream.of(1, 2, 3).map(String::valueOf).collect(joining(","));

sequence(1, 2, 3).toString(":"); // both return "1:2:3"
Stream.of(1, 2, 3).map(String::valueOf).collect(joining(":"));
{% endhighlight %}

Totallylazy seems to be marginally more concise, especially if we like our results as lists:

{% highlight java %}
sequence(1, 2, 3).toList();
Stream.of(1, 2, 3).collect(toList());
{% endhighlight %}

We moved to Java 8 streams anyway because it's one dependency less and most probably all
new stuff will build on the standard libraries.

<br>Check also the runnable gradle project with this example code
[here](https://github.com/yareeh/l8er/blob/master/src/test/java/l8er/TotallyLazyVsJava8.java#L32-L105).
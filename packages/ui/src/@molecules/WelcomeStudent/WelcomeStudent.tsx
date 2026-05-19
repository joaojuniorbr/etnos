interface WelcomeStudentProps {
	name: string;
}

export const WelcomeStudent = ({ name }: WelcomeStudentProps) => (
	<section className="ui:flex ui:flex-col ui:gap-1">
		<h1 className="ui:m-0 ui:text-lg ui:font-black ui:text-primary ui:md:text-xl ui:lg:text-3xl">
			Olá {name} 👋
		</h1>
		<p className="ui:m-0">Hoje é um ótimo dia para aprender sobre o Brasil.</p>
	</section>
);
